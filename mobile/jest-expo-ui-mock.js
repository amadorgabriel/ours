const React = require('react');
const { Pressable, ScrollView, Switch, Text, TextInput, View } = require('react-native');

function useNativeState(initial) {
  const ref = React.useRef({ value: initial });
  return ref.current;
}

function Host({ children }) {
  return React.createElement(View, null, children);
}

function BottomSheet({ children, isPresented, testID }) {
  if (!isPresented) return null;
  return React.createElement(View, { testID }, children);
}

function Column({ children }) {
  return React.createElement(View, null, children);
}

function Button({ label, onPress, disabled, testID, children }) {
  return React.createElement(
    Pressable,
    {
      accessibilityRole: 'button',
      accessibilityLabel: label,
      disabled,
      onPress,
      testID,
    },
    children ?? React.createElement(Text, null, label)
  );
}

function ExpoText({ children, testID }) {
  return React.createElement(Text, { testID }, children);
}

function ExpoTextInput({ value, onChangeText, placeholder, testID, maxLength, multiline }) {
  return React.createElement(TextInput, {
    accessibilityLabel: testID,
    maxLength,
    multiline,
    onChangeText: (text) => {
      if (value) value.value = text;
      onChangeText?.(text);
    },
    placeholder,
    testID,
    value: value?.value ?? '',
  });
}

function ExpoSwitch({ label, value, onValueChange }) {
  return React.createElement(Switch, {
    accessibilityLabel: label,
    onValueChange,
    value,
  });
}

function FieldGroup({ children }) {
  return React.createElement(View, null, children);
}

function Section({ children }) {
  return React.createElement(View, null, children);
}

FieldGroup.Section = Section;
FieldGroup.SectionHeader = Section;
FieldGroup.SectionFooter = Section;

function Picker({ children, onValueChange, selectedValue, testID }) {
  return React.createElement(View, { onValueChange, selectedValue, testID }, children);
}

Picker.Item = function PickerItem() {
  return null;
};

function RNHostView({ children }) {
  return React.createElement(View, null, children);
}

module.exports = {
  BottomSheet,
  Button,
  Column,
  FieldGroup,
  Host,
  Picker,
  RNHostView,
  ScrollView,
  Switch: ExpoSwitch,
  Text: ExpoText,
  TextInput: ExpoTextInput,
  useNativeState,
};
