const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.initializeDrive();
  }

  initializeDrive() {
    try {
      // You need to set up Google Cloud Service Account and download credentials
      // Method 1: Using service account JSON file
      const keyFilePath = path.join(__dirname, '../google-credentials.json');
      
      if (fs.existsSync(keyFilePath)) {
        const auth = new google.auth.GoogleAuth({
          keyFile: keyFilePath,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
        
        this.drive = google.drive({ version: 'v3', auth });
        console.log('✅ Google Drive initialized with service account');
      } 
      // Method 2: Using environment variables for service account
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const auth = new google.auth.JWT(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          null,
          process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/drive.file']
        );
        
        this.drive = google.drive({ version: 'v3', auth });
        console.log('✅ Google Drive initialized with JWT');
      } else {
        console.warn('⚠️ Google Drive credentials not found. Drive upload disabled.');
      }
    } catch (error) {
      console.error('❌ Error initializing Google Drive:', error);
    }
  }

  async uploadFile(filePath, fileName) {
    if (!this.drive) {
      console.warn('⚠️ Google Drive not initialized. Skipping upload.');
      return null;
    }

    try {
      const fileMetadata = {
        name: fileName,
        parents: this.folderId ? [this.folderId] : [],
      };

      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      // Make file publicly readable (optional)
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      console.log(`✅ File uploaded to Google Drive: ${response.data.webViewLink}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error);
      throw error;
    }
  }

  async updateFile(fileId, filePath) {
    if (!this.drive) {
      console.warn('⚠️ Google Drive not initialized. Skipping update.');
      return null;
    }

    try {
      const media = {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id, webViewLink',
      });

      console.log(`✅ File updated on Google Drive: ${response.data.webViewLink}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating file on Google Drive:', error);
      throw error;
    }
  }

  async findOrCreateFile(fileName) {
    if (!this.drive) {
      return null;
    }

    try {
      // Search for existing file
      const response = await this.drive.files.list({
        q: `name='${fileName}' and '${this.folderId}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink)',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0];
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error searching file on Google Drive:', error);
      return null;
    }
  }
}

module.exports = new GoogleDriveService();