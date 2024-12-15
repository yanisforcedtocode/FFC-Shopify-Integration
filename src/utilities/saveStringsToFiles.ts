import path from "path"
import fs from 'fs'

export const writeStringToFile = async(filePath:string, content:string) => {
    try {
        return new Promise((resolve, reject) => {
          fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
            if (err) {
              return reject(err);
            }
            fs.writeFile(filePath, content, 'utf8', (err) => {
              if (err) {
                return reject(err);
              }
              resolve('file written');
            });
          });
        });
    } catch (error) {
        console.log(error)
    }
  }

  export const readFileContent = async(filePath: string) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  }
  
  // Example usage:
