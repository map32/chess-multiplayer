export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

export const millisecondsToSeconds = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const tenthsOfSecond = Math.floor((milliseconds % 1000) / 100);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    const formattedTenthsOfSecond = String(tenthsOfSecond);

    return `${formattedMinutes}:${formattedSeconds}.${formattedTenthsOfSecond}`;
  }