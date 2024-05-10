import admin from "firebase-admin";
const config = {
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "ece464-ceb3d",
        "private_key_id": "4e5e4fd65ba085fb4294c1048a7f352c9525c6a4",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRUoogK8d/WP/B\ns4/EPr2+JJH33LjwRaVWYTC+2c0KrxF1fZW59dbVHghkfGJI91R/UOj4UKDmbnqX\nDJZKFAx+D0Q5X89gKRIrqz3LYA4o4cEUuQ/nNg5kA6WdWGKWum2+ExnS1WaRwoNv\nYuj3cwLtvepQ7rW5fAoKLu5yCfy7Ydv4GD4+1Lj47xNSlxZgt31fIAu5eIKxqYwg\nJ4f+DFOCgN0bezNGdb4YFJQb9yxiRKR8UyKV4EDNIwyKiuRzbglUwW3QUUvfxcAS\nan8Fn+oGVksUdP7q4/cO6lYhV2sGcAI+Cfi1fc7NEU13i7MeaRiz/7o5kf0ISqEn\nAGUkcetFAgMBAAECggEAH7D1sR+3tU/h7u9y54URQKG0SNjN1jDRMrYFxYtfqAuv\n4sAoBE7UXxFMN3x+e+oYTKtRDlFUvvaAkHBrK52D86z3iRE4qigltF9ZfHpXQnjF\nfQ/0uK5+OMW1lBAu4v+oQFQPf5RoEk7nC9znhRlQWvK7MFQnxsShF4AaAUGCVlMZ\nEYwic6muUlXZXS+OL+ZMBKFGchXLaOWt+H0VRc9JScAL+DmkBgsp7qyLiGQW753Y\nOqXuec5ZDG1GBZ/yhW7jZQhH50R2hdsBUd9Kbp+wYcPwJiuchhhun06pSftt3SW9\nvwcCWSrT7u5G+DpxcMdSHguaPZeaH+8+jt7nI9s66QKBgQD4ErtGTmadlnmDtplb\n/cn3murH/L61LeP8JyJCTdyYfdPSO6V/6naMCxnltHEPcePDgAFc6b4kVVQOoL0x\neUXugA9DmzhjFdp8fl7FcbfC1Xz5gA8ud8h1a7SJ4l7HgJrncz7vIV8EH2qYAAyl\nwpZ6EQ/CSurltBRABZPio7qa+QKBgQDYAtJ72z6QNZTEopd6JOQEYoAFFyuILv6/\nEudWN13+tIfYYcvGHJSiGbZgE068jI/DNJlqzzhcjLLggNP/RcsftzUx42c057sa\nRlM5Mjj/xm65x2/+ePpspiaKbnBP9y9GJ/Ivw+/o0C4MaIB/xa0EmpkdxS6q7UIt\nS0/o1zP5rQKBgQCNv+ZS3im0km8M3CH1dqcZXOQbMkimrno/cv0YdfU/DWckEgEX\nfpoOm6lIoDqaYLGM3G/q74U+raNCWIbC5lEXXwVZ1C/8LliSGoN8vuYJ5oNq7cm+\n+6MHtWuL/lW6Gbpp1mh3q9HnQSxffme7r9zcEzO2Caj/aE7J5mYCcxwFwQKBgF+U\nyBxEBCf9fYmQxGQoxLhn+WvHN9z3poNX0wNkVnQo399QTsGnzeD4bamPgYyOyeI/\neQ85CCBzpYcPmj7fXCT5hVFA5V8UlsbmjVbGsVAENuR/qj+4ul6vGmiwu4O2xbVO\nYazfD14+F9Inv4xKJOffnJb+tEqv11OBeqd16iq1AoGAVQmQulHCcBEy+gRrnTvF\n5dNIsmPfV4McgS4OkACds3jV2gt4btlBBtl6tmCaLzY3g0lZRXw0+jgIhCjmLcZD\noly7cFwYiXIQii4C+xk+IueFy7svM+Td3MfBCE3ZQQ4XxtDC9sENo2A66Yikb66n\nXGv2422zw3EYMF9rIddSHL8=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-26bjg@ece464-ceb3d.iam.gserviceaccount.com",
        "client_id": "105627286446182312743",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-26bjg%40ece464-ceb3d.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
    }),
  };
  
  const firebase = admin.apps.length
    ? admin.app()
    : admin.initializeApp(config);

    export default firebase;
    