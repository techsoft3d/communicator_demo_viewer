const fs = require('fs-extra')
const path = require('path');

if (process.argv.length < 3 || process.argv[2] === ""){
	console.log("Please specify an absolute path to a HOOPS Communicator Package.");
	process.exit(1);
}

const platform = ( /^win/.test(process.platform) ) ? 'Windows' : 'Linux';
const bin_dir = (platform == 'Windows') ? 'win64_v140' : 'linux64';

const src_package_path = process.argv[2];
const dest_package_path = path.join(__dirname, "..", "bin");

console.log( "Platform: " + platform );
console.log("\nSource Communicator Package: " + src_package_path);
console.log("\nDestination Application Path: " + dest_package_path);


const converter_bin_directory = path.join(src_package_path, `authoring/converter/bin/${bin_dir}`);
const viewer_bin_directory = path.join(src_package_path, `server/bin/${bin_dir}`);
const csr_viewer_settings_file = path.join(__dirname, "viewer_settings_csr.xml");
const ssr_viewer_settings_file = path.join(__dirname, "viewer_settings_ssr.xml");

const web_viewer_javascript_source_dir = path.join(src_package_path, "web_viewer/src/js");
const web_viewer_javascript_dest_dir = path.join(__dirname, "..", "/src/default_viewer/js");
const scz_test_source_file = path.join(src_package_path, "quick_start/converted_models/standard/sc_models", "microengine.scz");
const cad_test_source_file = path.join(src_package_path, "authoring/converter/example/_data", "landinggearmainshaftwithpmi_fullpmi.catpart");
const scz_test_dest_file = path.join(__dirname, "..", "tests/test_data", "microengine.scz");
const cad_test_dest_file = path.join(__dirname, "..", "tests/test_data", "landinggearmainshaftwithpmi_fullpmi.catpart");

fs.ensureDirSync(dest_package_path);

console.log("\nCopying Converter Binaries from: " + converter_bin_directory);
fs.copySync(converter_bin_directory, dest_package_path);

console.log("\nCopying Viewer Binaries from: " + viewer_bin_directory);
fs.copySync(viewer_bin_directory, dest_package_path);

console.log("\nCopying Web Viewer src file from: " + web_viewer_javascript_source_dir);
fs.copySync(web_viewer_javascript_source_dir, web_viewer_javascript_dest_dir);

console.log("\nCopying test data from: " + scz_test_source_file + " ," + cad_test_source_file );
fs.copySync(scz_test_source_file, scz_test_dest_file);
fs.copySync(cad_test_source_file, cad_test_dest_file);

const csr_dest_settings_file = path.join(dest_package_path, "viewer_settings_csr.xml");
console.log("\nCopying CSR Viewer Settings file from: " + csr_viewer_settings_file);
fs.copySync(csr_viewer_settings_file, csr_dest_settings_file);

const ssr_dest_settings_file = path.join(dest_package_path, "viewer_settings_ssr.xml");
console.log("\nCopying SSR Viewer Settings file from: " + ssr_viewer_settings_file);
fs.copySync(ssr_viewer_settings_file, ssr_dest_settings_file);