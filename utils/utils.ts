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

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  date.setHours(date.getHours());
  const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
  };

  return date.toLocaleDateString('en-US', options);
};

export const fetchFileFromUrl = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const fileName = url.split("/").pop();
  return new File([blob], fileName || "file");
}    

export const getCookieValue = async (name: string) => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null
}

export const decodeJWT = (token: string) => {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (error){
    console.error(error);
    return null;
  }
}

