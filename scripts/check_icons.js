const l = require('lucide-react');
const icons = Object.keys(l).filter(k => {
  const lk = k.toLowerCase();
  return lk.includes('instagram') || lk.includes('twitter') || lk.includes('youtube') || lk === 'x';
});
console.log(icons.join(', '));
