# CI/CD Web
Continuous Integration & Delivery Angular 9 Web SPA for [CI/CD API](https://github.com/rlrecalde/CICD_API).

## References
Please, refer to "CICD Web.pdf" document to get more details about how does it work.  

## Notes
After download it:
```
npm install
ng build
ng serve --open
```
*Make sure you have Angular 9.1.13 or higher version installed on your machine.*

## Troubleshooting
This application was developed with Angular v9, NodeJs v10 and npm v6.  
Given that newer versions of them might present compatibility issues, please follow next steps:  
*(For example, I downloaded it on a machine with Angular v13, NodeJs v16 and npm v8, and 'ng build' command failed)*  
1. Remove *\node_modules* folder and *package-lock.json* file.
2. Run *npm install --force* command.
