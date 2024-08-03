export const generateGUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generatePassword = (birthDate: string) => {
  const date = new Date(birthDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
  const day = date.getUTCDate() + 1;

  return `el3mes${day}/${month}/${year}`;
}