const inappropriateWords = [
    'เหี้ย', 'ควย', 'สัส', 'แตด', 'เยส', 'เย็ด', 'สัด','เงี่ยน','หี',
    // Add more inappropriate words as needed
  ];
  
  export const containsInappropriateContent = (text) => {
    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  };