import './css/App.css';

import PDFView from './components/PDFView';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header-item"></div>
        <div className="App-header-item">PDF Save</div>
        <div className="App-header-item"></div>
      </header>
      <div className="App-content">
          <PDFView />
      </div>
    </div>
  );
}

export default App;
