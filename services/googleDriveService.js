const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.initialize();
  }

  initialize() {
    try {
      const keyFilePath = path.join(__dirname, '../credentials/google-drive-credentials.json');
      
      // Check if credentials file exists
      if (!fs.existsSync(keyFilePath)) {
        console.warn('⚠️ Google Drive credentials file not found. Google Drive integration will be disabled.');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: keyFilePath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive:', error);
    }
  }

  async uploadFile(filePath, fileName, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
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
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, createdTime',
      });

      console.log(`✅ File uploaded to Google Drive: ${response.data.webViewLink}`);
      
      // Make file publicly accessible (optional)
      try {
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permError) {
        console.warn('⚠️ Could not set public permission:', permError.message);
      }

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        createdTime: response.data.createdTime,
      };
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error);
      throw error;
    }
  }

  async listFiles(pageSize = 10) {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents and mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'`,
        pageSize: pageSize,
        fields: 'files(id, name, webViewLink, createdTime, modifiedTime)',
        orderBy: 'modifiedTime desc',
      });

      return response.data.files;
    } catch (error) {
      console.error('❌ Error listing files:', error);
      throw error;
    }
  }

  async getFile(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, webViewLink, createdTime, modifiedTime',
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error getting file:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      console.log(`✅ File ${fileId} deleted from Google Drive`);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();