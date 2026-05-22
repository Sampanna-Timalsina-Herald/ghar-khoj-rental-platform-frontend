export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(price)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatPhone = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/\D/g, '');

  // Nepal country code handling
  if (cleaned.startsWith('977')) {
    const number = cleaned.slice(3);
    return `+977 ${number}`;
  }

  // local Nepali number (98XXXXXXXX)
  if (cleaned.length === 10) {
    return `+977 ${cleaned}`;
  }

  return phone;
};