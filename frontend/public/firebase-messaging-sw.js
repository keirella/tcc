importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDW7dZYKxbQJFblR3XEzcV4HwnLkolLa5M",
  authDomain: "e-40-489101.firebaseapp.com",
  projectId: "e-40-489101",
  storageBucket: "e-40-489101.firebasestorage.app",
  messagingSenderId: "194342266835",
  appId: "1:194342266835:web:77dfaa8a17ace9a764b126",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/vite.svg',
  });
});