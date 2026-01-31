Pantry Planner

A smart inventory management system that uses real-time barcode scanning and open-source food data to track your household supplies.

## 🚀 Key Features

* **Real-time Barcode Scanning**: Leverages the `@zxing/browser` library to scan product barcodes directly from your browser or mobile device.
* **Automatic Product Lookup**: Integrates with the **Open Food Facts API** to automatically populate product names, brands, and quantities (e.g., "Taco Shells", "133g") upon scanning.
* **Smart Inventory Merging**: Automatically detects if a scanned item already exists in your pantry and increments the count instead of creating duplicates.
* **Live Database**: Powered by **Firebase Firestore** with real-time listeners, ensuring your pantry list updates instantly across all devices.

## 🛠️ Tech Stack

* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript
* **Database**: Firebase Firestore
* **API**: Open Food Facts (v2)
* **Scanning Engine**: ZXing (Zebra Crossing)

## 📦 Installation & Setup

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/pantry-planner.git
cd pantry-planner

```


2. **Install dependencies**:
```bash
npm install

```


3. **Environment Variables**:
Create a `.env.local` file and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

```


4. **Run the development server**:
```bash
npm run dev

```



## 🔌 API Integration Note

This project uses the **Open Food Facts API**. To comply with their terms of use and ensure reliable scanning:

* All requests include a custom **User-Agent** header in the format `AppName/Version (ContactEmail)` to avoid being identified as a bot.
* Rate limiting is handled by identifying the application to the server.

## 🏗️ Architecture

* **`hooks/useBarcodeScanner.ts`**: Manages the camera hardware lifecycle, ensuring the webcam is physically disabled when not in use to save battery and maintain privacy.
* **`lib/pantryActions.ts`**: Handles the server-side logic for "upserting" items—deciding whether to update an existing entry or create a new one based on barcode data.
* **`components/ConfirmScannedItemModal.tsx`**: A controlled form that allows users to verify and edit API-fetched data before it is saved to the database.

---

**Would you like me to add a "Troubleshooting" section specifically for the camera permissions and "Width 0" errors we solved?**
