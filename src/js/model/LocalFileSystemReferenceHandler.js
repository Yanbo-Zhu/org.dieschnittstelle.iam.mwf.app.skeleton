/*

The term Blob stands for Binary Large Object. In web development, it's used to represent immutable, raw binary data — like files, images, videos, or arbitrary byte data.

In JavaScript (especially in browser environments), Blob is a built-in object that allows you to store and manipulate binary data in a file-like way.
 */

const fsRoot = "myapp_data";
const fsPrefix = "opfs://";

let instance;

export class LocalFileSystemReferenceHandler {

    rootDirectoryHandle;

    constructor(rootDirectoryHandle) {
        this.rootDirectoryHandle = rootDirectoryHandle;
    }

    // the lfs access must not be done once loading the module
    static async getInstance() {
        if (instance) {
            return instance;
        }

        const lfsRoot = await navigator.storage.getDirectory();
        console.log("lfsRoot: ", lfsRoot);

        // create a folder for the images in the root if it does not exist so far
        const directoryHandle = await lfsRoot.getDirectoryHandle(fsRoot, {
            create: true,
        });

        instance = new LocalFileSystemReferenceHandler(directoryHandle);
        return instance;
    }

    // takes filedata and creates a (proprietary) url/local file system reference/url to it
    // input parameter filedata ( currentMediaItem.src) -> filename  -> create a file handle -> create a fileContentStream based on the file handle -> write the filedata ( currentMediaItem.src)  to the fileContentStream-> return a url (fsPrefix + filename) pointing to the filedata
    async createLocalFileSystemReference(filedata) {

        // use the name of the file
        const filename = filedata.name.replaceAll(" ","_");

        // get a handle for writing the filedata
        const fileHandle = await this.rootDirectoryHandle.getFileHandle(
            filename,
            { create: true },
        );

        // write the filedata
        // fileContentStream is a writable stream used to write data (such as a file or blob) to the local file system. It’s part of the File System Access API (used in modern browsers), or a similar local storage system in environments like Electron.
        const fileContentStream = await fileHandle.createWritable(); // This creates a writable stream for the file you want to save.
        await fileContentStream.write(filedata); // This writes the actual content (filedata, which is probably a Blob or File) into the file.
        await fileContentStream.close(); // This closes the stream, finalizing the write operation and making sure the data is saved.

        console.log("LocalFileSystemReferenceHandler.stored: ", filename);

        // return a url pointing to the filedata
        return fsPrefix + filename;
    }

    // resolves a proprietary url/ local url in local file system to an object url
    // converts a local file system reference/url (like opfs://myapp_data/myfile.jpg) to a  Object URL that can be used in the browser.
    // local file system reference/url -> filename -> retrieve FileData ( in blob format) -> Create ObjectURL through URL.createObjectURL()
    // When you use URL.createObjectURL(blob), you get a temporary URL like: blob:http://localhost:3000/9fc74be4-6f91-4a5e-b7c1-93c6e13f23ab. You can use this in an <img src="...">, <a href="...">, <video>, etc.
    async resolveLocalFileSystemReference(fileurl) {
        if (!fileurl.startsWith(fsPrefix)) {
            return fileurl;
        }
        // determine the filename
        const filename = fileurl.substring(fsPrefix.length);

        // try to access the file content
        const retrievedFileContentHandle = await this.rootDirectoryHandle.getFileHandle(filename);
        const retrievedFileData = await retrievedFileContentHandle.getFile();

        console.log("retrievedFileData is: ", retrievedFileData);

        const retrievedFileObjectUrl = URL.createObjectURL(retrievedFileData);

        console.log("LocalFileSystemReferenceHandler.resolved: ", fileurl, retrievedFileObjectUrl);

        return retrievedFileObjectUrl;
    }

}