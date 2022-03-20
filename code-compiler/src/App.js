/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/
import { useState } from 'react';
import './App.css';
import Editor from "@monaco-editor/react";
import Navbar from './Components/Navbar';
import Axios from 'axios';
import spinner from './spinner.svg';

function App() {

// State variable to set users source code
const [userCode, setUserCode] = useState(``);

// State variable to set editors default language
const [userLang, setUserLang] = useState("python");

// State variable to set editors default theme
const [userTheme, setUserTheme] = useState("vs-dark");

// State variable to set editors default font size
const [fontSize, setFontSize] = useState(20);

// State variable to set users input
const [userInput, setUserInput] = useState("");

// State variable to set users output
const [userOutput, setUserOutput] = useState("");

// Loading state variable to show spinner
// while fetching data
const [loading, setLoading] = useState(false);

const options = {
	fontSize: fontSize
}

// Function to call the compile endpoint
function compile() {
	setLoading(true);
	if (userCode === ``) {
	return
	}

	// Post request to compile endpoint

	Axios.post(`https://codecompilerserver.herokuapp.com/compile`, {
	code: userCode,
	language: userLang,
	input: userInput }).then((res) => {
	setUserOutput(res.data.output);
	}).then(() => {
	setLoading(false);
	})
}

// Function to clear the output screen
function clearOutput() {
	setUserOutput("");
}

return (
	<div className="App">
	<Navbar
		userLang={userLang} setUserLang={setUserLang}
		userTheme={userTheme} setUserTheme={setUserTheme}
		fontSize={fontSize} setFontSize={setFontSize}
	/>
	<div className="main">
		<div className="left-container">
		<Editor
			options={options}
			height="calc(100vh - 50px)"
			width="100%"
			theme={userTheme}
			language={userLang}
			defaultLanguage="python"
			defaultValue="# Enter your code here"
			onChange={(value) => { setUserCode(value) }}
		/>
		<button className="run-btn" onClick={() => compile()}>
			Run
		</button>
		</div>
		<div className="right-container">
		<h4>Input:</h4>
		<div className="input-box">
			<textarea id="code-inp" onChange=
			{(e) => setUserInput(e.target.value)}>
			</textarea>
		</div>
		<h4>Output:</h4>
		{loading ? (
			<div className="spinner-box">
		<img src={spinner} alt="Loading..." /> 
			</div> 
		) : (
			<div className="output-box">
			<pre>{userOutput}</pre>
			<button onClick={() => { clearOutput() }}
				className="clear-btn">
				Clear
			</button>
			</div>
		)}
		</div>
	</div>
	</div>
);
}

export default App;
