Getting Started with HOOPS Communicator desktop application development.

On Windows 10 This has been tested with the following versions:
node --version	:	v20.2.0
npm --version	:	v9.6.6

Prerequisites:
You will need to have git, npm, node installed and on your path.  Visual Studio Code is also recommneded.

1. Navigate to the communicator_demo_viewer folder and run: npm install

2. Set up the communicator binaries by using the utility script:  node dev/set_communicator_package.js /path/to/your/HOOPS_Communicator_2023_SP2
	Note: This has been tested up to HC 2023 SP2

3. Add your HC license string to the bottom of src/main.js where it says "Add your license here".
	
4. You can start the application by writing: npm start

5. You can run the tests with the following command: npm test (currently broken - as of 11.1.2023)
	
Notes:
	Javascript compilation is currently disabled due to the fact that hoops_web_viewer.js too big and causes the package process to fail.  There are some ways we can get around this if we actually invest resources into this application.

	You can use any development environment you'd like, but there are build/debug/test targets for VS Code.