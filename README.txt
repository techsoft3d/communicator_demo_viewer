Getting Started with HOOPS Communicator desktop application development.

On Windows 10 and Ubuntu 16.04 This has been tested with the following versions:
node --version	:	v8.9.1
npm --version	:	v5.5.1

Prerequisites:
You will need to have git installed and on your path.

For Ubuntu 16.04 LTS you will need to enable nodesource to get nodev8 installed on your system:
https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
You will also need to modify NPM's module directory: 
https://docs.npmjs.com/getting-started/fixing-npm-permissions

1. Navigate to the communicator_demo_viewer folder and run: npm install

2. Set up the communicator binaries by using the utility script:  node dev/set_communicator_package.js /path/to/your/HOOPS_Communicator_2017_SP2_U1
	Note: This has been tested up to HC 2019 SP1

3. Add your HC license string to the bottom of src/Index.js where it says "Add your license here".  You'll also need to add it to both of the viewer settings files under the bin directory.
	
4. You can start the application by writing: npm start

5. You can run the tests with the following command: npm test
	
Notes:
	Javascript compilation is currently disabled due to the fact that hoops_web_viewer.js too big and causes the package process to fail.  There are some ways we can get around this if we actually invest resources into this application.

	You can use any development environment you'd like, but there are build/debug/test targets for VS Code and you can use the perforce plugin for MS Code to make it easier to develop with P4.