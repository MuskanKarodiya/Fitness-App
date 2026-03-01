const tintColorLight = '#7F57F2'; // Vibrant Purple
const tintColorDark = '#9F7AEA'; // Lighter Purple for Dark Mode

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    cardBackground: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dark: {
    text: '#fff',
    background: '#000000', // Pure Black
    tint: tintColorDark,
    tabIconDefault: '#666',
    tabIconSelected: tintColorDark,
    cardBackground: '#1C1C1E', // Dark Gray Card
    borderColor: '#333',
  },
};
