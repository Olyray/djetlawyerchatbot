// Mock for react-markdown
const React = require('react');

const ReactMarkdownMock = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'markdown-content' }, children);
};

module.exports = ReactMarkdownMock; 