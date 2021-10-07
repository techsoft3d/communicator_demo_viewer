Getting Started with HOOPS Communicator desktop application development.

On Windows 10, Ubuntu 18.04, and MacOS Big Sur, this has been tested with the following versions:
node --version	:	v15.11.0
npm --version	:	v7.24.2

Prerequisites:
You will need to have git installed and on your path.

For Ubuntu 18.04 LTS you will need to enable nodesource to get nodev8 installed on your system:
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
You will also need to modify NPM's module directory: 
https://docs.npmjs.com/getting-started/fixing-npm-permissions

1. Navigate to the communicator_demo_viewer folder and run: npm install

2. Set up the communicator binaries by using the utility script:  node dev/set_communicator_package.js /path/to/your/HOOPS_Communicator_Package
	Note: This has been tested up to HC 2021 SP2

3. Add your HC license string to the bottom of src/Index.js
	
4. You can start the application by writing: npm start

5. You can run the tests with the following command: npm test

Building:
npm install electron-packager -g
electron-packager .
	
Notes:
	Javascript compilation is currently disabled due to the fact that hoops_web_viewer.js too big and causes the package process to fail.  There are some ways we can get around this and it will be addressed in a future release.

	You can use any development environment you'd like, but there are build/debug/test targets for VS Code and you can use the perforce plugin for MS Code to make it easier to develop with P4.