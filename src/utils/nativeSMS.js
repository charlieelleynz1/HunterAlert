import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";
import { sendWhatsAppMessage, canSendWhatsApp } from "@/utils/nativeWhatsApp";

/**
 * Send SMS using the device's native cellular connection
 * Works with standard cellular and satellite services (e.g., One.nz satellite)
 *
 * @param {string} phoneNumber - The recipient's phone number
 * @param {string} message - The SMS message body
 * @returns {Promise<boolean>} - True if SMS app opened successfully
 */
export async function sendNativeSMS(phoneNumber, message) {
  try {
    // Format phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create SMS URL based on platform
    let smsUrl;
    if (Platform.OS === "ios") {
      // iOS format: sms:+64211234567&body=message
      smsUrl = `sms:${cleanNumber}&body=${encodedMessage}`;
    } else {
      // Android format: sms:+64211234567?body=message
      smsUrl = `sms:${cleanNumber}?body=${encodedMessage}`;
    }

    // Check if the device can handle SMS
    const canOpen = await Linking.canOpenURL(smsUrl);

    if (!canOpen) {
      console.error("Device cannot send SMS");
      return false;
    }

    // Open native SMS app with pre-filled message
    await Linking.openURL(smsUrl);
    return true;
  } catch (error) {
    console.error("Error opening SMS app:", error);
    return false;
  }
}

/**
 * Send SMS to multiple recipients using device's cellular connection
 * Opens SMS app once for each recipient (iOS limitation)
 *
 * @param {Array<{phoneNumber: string, name: string}>} recipients - Array of recipients
 * @param {string} message - The SMS message body
 * @returns {Promise<{sent: number, failed: number}>}
 */
export async function sendBulkNativeSMS(recipients, message) {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const success = await sendNativeSMS(recipient.phoneNumber, message);
      if (success) {
        sent++;
        // Small delay between opening SMS apps to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send SMS to ${recipient.name}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send emergency SOS via device's cellular connection
 * Formats message with location and emergency context
 *
 * @param {Array<{phone_number: string, contact_name: string}>} contacts - Emergency contacts
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @param {string} userName - Name of person sending SOS
 * @returns {Promise<{sent: number, failed: number}>}
 */
export async function sendEmergencySOS(
  contacts,
  latitude,
  longitude,
  userName,
) {
  if (!contacts || contacts.length === 0) {
    Alert.alert(
      "No Emergency Contacts",
      "Please add emergency contacts in your Profile first.",
    );
    return { sent: 0, failed: 0 };
  }

  // Create emergency message with location
  const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  const locationText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

  const message = `🚨 EMERGENCY ALERT from ${userName}!

Location: ${locationText}
View on map: ${mapLink}

This is an automated emergency message.`;

  console.log("Sending SOS via native SMS to", contacts.length, "contacts");
  console.log("Message:", message);

  // Format recipients for bulk send
  const recipients = contacts.map((contact) => ({
    phoneNumber: contact.phone_number,
    name: contact.contact_name,
  }));

  // Send via device's cellular connection (including satellite if available)
  const result = await sendBulkNativeSMS(recipients, message);

  console.log(`SOS Result: ${result.sent} sent, ${result.failed} failed`);

  return result;
}

/**
 * Check if device supports SMS
 * @returns {Promise<boolean>}
 */
export async function canSendSMS() {
  try {
    const canOpen = await Linking.canOpenURL("sms:");
    return canOpen;
  } catch (error) {
    console.error("Error checking SMS support:", error);
    return false;
  }
}

/**
 * Send emergency SOS with fallback between SMS and WhatsApp
 * Tries each contact's preferred method first, then falls back to the alternative
 *
 * @param {Array<{phone_number: string, contact_name: string, preferred_method: string}>} contacts
 * @param {number} latitude - Current latitude
 * @param {number} longitude - Current longitude
 * @param {string} userName - Name of person sending SOS
 * @returns {Promise<{sms: {sent: number, failed: number}, whatsapp: {sent: number, failed: number}, total: {sent: number, failed: number}}>}
 */
export async function sendEmergencySOSWithFallback(
  contacts,
  latitude,
  longitude,
  userName,
) {
  if (!contacts || contacts.length === 0) {
    Alert.alert(
      "No Emergency Contacts",
      "Please add emergency contacts in your Profile first.",
    );
    return {
      sms: { sent: 0, failed: 0 },
      whatsapp: { sent: 0, failed: 0 },
      total: { sent: 0, failed: 0 },
    };
  }

  // Create emergency message with location
  const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
  const locationText = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;

  const message = `🚨 EMERGENCY ALERT from ${userName}!

Location: ${locationText}
View on map: ${mapLink}

This is an automated emergency message.`;

  console.log("SOS: Sending with fallback to", contacts.length, "contacts");

  // Check which methods are available on this device
  const smsAvailable = await canSendSMS();
  const whatsAppAvailable = await canSendWhatsApp();

  console.log(
    "SOS: SMS available:",
    smsAvailable,
    "WhatsApp available:",
    whatsAppAvailable,
  );

  const results = {
    sms: { sent: 0, failed: 0 },
    whatsapp: { sent: 0, failed: 0 },
    total: { sent: 0, failed: 0 },
  };

  for (const contact of contacts) {
    const method = contact.preferred_method || "sms";
    const cleanNumber = contact.phone_number;
    const name = contact.contact_name;
    let sent = false;

    console.log(`SOS: Sending to ${name} via preferred method: ${method}`);

    if (method === "whatsapp" || method === "both") {
      // Try WhatsApp first
      if (whatsAppAvailable) {
        sent = await sendWhatsAppMessage(cleanNumber, message);
        if (sent) {
          results.whatsapp.sent++;
          results.total.sent++;
          console.log(`SOS: ✅ WhatsApp sent to ${name}`);
        }
      }

      // Fallback to SMS if WhatsApp failed
      if (!sent && smsAvailable) {
        console.log(`SOS: WhatsApp failed for ${name}, falling back to SMS`);
        sent = await sendNativeSMS(cleanNumber, message);
        if (sent) {
          results.sms.sent++;
          results.total.sent++;
          console.log(`SOS: ✅ SMS fallback sent to ${name}`);
        }
      }

      // If method is "both", also send SMS after WhatsApp
      if (method === "both" && sent && smsAvailable) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        const smsSent = await sendNativeSMS(cleanNumber, message);
        if (smsSent) {
          results.sms.sent++;
          results.total.sent++;
          console.log(`SOS: ✅ Both methods - SMS also sent to ${name}`);
        }
      }
    } else {
      // SMS is preferred
      if (smsAvailable) {
        sent = await sendNativeSMS(cleanNumber, message);
        if (sent) {
          results.sms.sent++;
          results.total.sent++;
          console.log(`SOS: ✅ SMS sent to ${name}`);
        }
      }

      // Fallback to WhatsApp if SMS failed
      if (!sent && whatsAppAvailable) {
        console.log(`SOS: SMS failed for ${name}, falling back to WhatsApp`);
        sent = await sendWhatsAppMessage(cleanNumber, message);
        if (sent) {
          results.whatsapp.sent++;
          results.total.sent++;
          console.log(`SOS: ✅ WhatsApp fallback sent to ${name}`);
        }
      }
    }

    if (!sent) {
      results.total.failed++;
      if (method === "whatsapp") {
        results.whatsapp.failed++;
      } else {
        results.sms.failed++;
      }
      console.log(`SOS: ❌ All methods failed for ${name}`);
    }

    // Delay between contacts
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("SOS: Final results:", JSON.stringify(results));
  return results;
}
