const inappropriateWords = [
    'เหี้ย', 'ควย', 'สัส', 'แตด', 'เยส', 'เย็ด', 'สัด','เงี่ยน','หี','Fuck','fuck','หำ','จิ๋ม','คลิปหลุด','xxx','Max33','max33',
    // Add more inappropriate words as needed
  ];
  
  export const containsInappropriateContent = (text) => {
    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => lowerText.includes(word));
  };