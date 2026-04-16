import * as Linking from "expo-linking";
import { Platform, Alert } from "react-native";

/**
 * Send a WhatsApp message using the device's WhatsApp installation
 * Works with Starlink satellite WhatsApp connectivity
 *
 * @param {string} phoneNumber - The recipient's phone number (with country code)
 * @param {string} message - The message body
 * @returns {Promise<boolean>} - True if WhatsApp opened successfully
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    // Format phone number - remove spaces, dashes, and leading + for WhatsApp URL
    const cleanNumber = phoneNumber.replace(/[^\d]/g, "");

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);

    // WhatsApp deep link format
    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;

    // Check if WhatsApp is installed
    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (!canOpen) {
      console.log("WhatsApp not installed or cannot be opened");
      return false;
    }

    // Open WhatsApp with pre-filled message
    await Linking.openURL(whatsappUrl);
    return true;
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
    return false;
  }
}

/**
 * Send WhatsApp messages to multiple recipients
 * Opens WhatsApp once for each recipient
 *
 * @param {Array<{phoneNumber: string, name: string}>} recipients - Array of recipients
 * @param {string} message - The message body
 * @returns {Promise<{sent: number, failed: number}>}
 */
export async function sendBulkWhatsApp(recipients, message) {
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    try {
      const success = await sendWhatsAppMessage(recipient.phoneNumber, message);
      if (success) {
        sent++;
        // Small delay between opens to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Failed to send WhatsApp to ${recipient.name}:`, error);
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Check if WhatsApp is installed on the device
 * @returns {Promise<boolean>}
 */
export async function canSendWhatsApp() {
  try {
    const canOpen = await Linking.canOpenURL("whatsapp://send");
    return canOpen;
  } catch (error) {
    console.error("Error checking WhatsApp support:", error);
    return false;
  }
}
