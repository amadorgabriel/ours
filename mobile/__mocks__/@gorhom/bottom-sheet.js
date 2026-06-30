const React = require('react');
const { TextInput } = require('react-native');

const BottomSheetModal = React.forwardRef(({ children, onDismiss }, ref) => {
  React.useImperativeHandle(ref, () => ({
    present: jest.fn(),
    dismiss: jest.fn(() => onDismiss?.()),
  }));

  return children;
});

function BottomSheetModalProvider({ children }) {
  return children;
}

function BottomSheetScrollView({ children, ...props }) {
  return React.createElement('ScrollView', props, children);
}

function BottomSheetView({ children, ...props }) {
  return React.createElement('View', props, children);
}

const BottomSheetTextInput = TextInput;

module.exports = {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetFlatList: BottomSheetScrollView,
  BottomSheetBackdrop: 'View',
  BottomSheetTextInput,
};
