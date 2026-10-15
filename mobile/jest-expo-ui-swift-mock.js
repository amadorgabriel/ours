const React = require('react');
const { View } = require('react-native');

function Host({ children }) {
  return React.createElement(View, null, children);
}

function Group({ children }) {
  return React.createElement(View, null, children);
}

function BottomSheet({ children, isPresented }) {
  if (!isPresented) return null;
  return React.createElement(View, null, children);
}

module.exports = { BottomSheet, Group, Host };
