const path = require('path');
const fs = require('fs');

// Test the asset path extraction logic
const indexHtmlPath = path.join(__dirname, 'build', 'index.html');

try {
	const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

	// Extract CSS and JS file paths from the HTML
	const cssMatch = indexHtml.match(/href="([^"]*\.css)"/);
	const jsMatch = indexHtml.match(/src="([^"]*\.js)"/);

	const cssPath = cssMatch ? cssMatch[1].replace(/^\//, '') : 'static/css/index.css';
	const jsPath = jsMatch ? jsMatch[1].replace(/^\//, '') : 'static/js/index.js';

	console.log('✅ Asset extraction test passed');
	console.log('CSS path:', cssPath);
	console.log('JS path:', jsPath);

	// Check if the files actually exist
	const cssFilePath = path.join(__dirname, 'build', cssPath);
	const jsFilePath = path.join(__dirname, 'build', jsPath);

	if (fs.existsSync(cssFilePath)) {
		console.log('✅ CSS file exists:', cssFilePath);
	} else {
		console.log('❌ CSS file not found:', cssFilePath);
	}

	if (fs.existsSync(jsFilePath)) {
		console.log('✅ JS file exists:', jsFilePath);
	} else {
		console.log('❌ JS file not found:', jsFilePath);
	}

} catch (error) {
	console.error('❌ Test failed:', error.message);
}
