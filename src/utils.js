export function formatDate(timestamp) {
    // Convert Firestore Timestamp to JavaScript Date
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    // Format the date as desired
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }