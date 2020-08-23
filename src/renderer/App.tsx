import { ipcRenderer as ipc } from 'electron';
import React, { useEffect, useState, useCallback } from 'react';
import { hot } from 'react-hot-loader/root';
import { ThemeProvider } from 'styled-components';
import { VaultProvider, VaultUI, themes } from '@buttercup/ui';
import {
  AttachmentManager,
  Credentials,
  Entry,
  EntryPropertyValueType,
  VaultFormatA,
  VaultFormatB,
  VaultSource,
  VaultManager,
  consumeVaultFacade,
  createVaultFacade,
  init as initButtercup,
  setDefaultFormat
} from 'buttercup/web';
import '@buttercup/ui/dist/styles.css';

// ipc.send('init');

try {
  initButtercup();
} catch (err) {}

function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function createArchive(vault, source) {
  const [general] = vault.findGroupsByTitle('General');
  general
    .createEntry('Home wi-fi')
    .setProperty('username', 'somehow')
    .setProperty('password', 'idsfio49v-1')
    .setProperty('password', 'h78.dI2m;110')
    .setProperty('password', '[5LC-j_"C7b;"nbn')
    .setProperty('password', '8rE7=Xkm<z5~b/[Q')
    .setProperty('password', 'ReGKd4H5?D5;=y~D')
    .setProperty('password', 'f>ZSh-,!Ly7Hrd&:Cv^@~,d')
    .setProperty('password', '7#eELw%GS^)/"')
    .setProperty('password', 'K3"J8JSKHk|5hwks_^')
    .setProperty('password', 'x8v@mId01')
    .setProperty('url', 'https://google.com');
  general
    .createEntry('Social')
    .setProperty('title', 'Social website')
    .setProperty('username', 'user@test.com')
    .setProperty('password', 'vdfs867sd5')
    .setProperty(
      'otpURI',
      'otpauth://totp/ACME:AzureDiamond?issuer=ACME&secret=NB2W45DFOIZA&algorithm=SHA1&digits=6&period=30'
    )
    .setProperty(
      'otpURL',
      'otpauth://totp/ACME%20Co:john.doe@email.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30'
    )
    .setAttribute(
      `${Entry.Attributes.FieldTypePrefix}otpURI`,
      EntryPropertyValueType.OTP
    )
    .setProperty('url', 'https://site.com/setup/create-account.php?token=123')
    .setProperty('url', 'https://site.com/login.php')
    .setProperty('url', 'https://site.com')
    .setProperty('Recovery pin', '1234');
  general
    .createEntry('Gate lock combination')
    .setProperty('username', 'test')
    .setProperty('password', '4812')
    .setProperty('password', 'passw0rd');
  // const attachmentEntry = general
  //   .createEntry('Entry w/ Attachments')
  //   .setProperty('username', 'jsc@test.org')
  //   .setProperty('password', '34n54mlflml3')
  //   .setProperty('url', 'https://test.com')
  //   .setProperty('PIN', '1200');
  // await source.attachmentManager.setAttachment(
  //   attachmentEntry,
  //   AttachmentManager.newAttachmentID(),
  //   ATTACHMENT_IMG,
  //   'my-image.png',
  //   'image/png'
  // );
  // await source.attachmentManager.setAttachment(
  //   attachmentEntry,
  //   AttachmentManager.newAttachmentID(),
  //   ATTACHMENT_BLOB,
  //   'special-file.blob',
  //   'application/octet-stream'
  // );
  const notes = vault.createGroup('Notes');
  notes
    .createEntry('Meeting notes 2019-02-01')
    .setAttribute(Entry.Attributes.FacadeType, 'note')
    .setProperty(
      'note',
      'Team meeting\n\n - Cool item created\n   - To be released sometime\n   - Costs $$$\n - Bug found, oh noes\n   - Fire Tim\n   - Bye Tim!\n - Success ✌️\n\nAll done.\n'
    );
  notes.createGroup('Meetings');
  const personal = notes.createGroup('Personal');
  personal.createGroup('Test');
  return vault;
}

function createArchiveFacade(vault) {
  return JSON.parse(JSON.stringify(createVaultFacade(vault)));
}

function processVaultUpdate(archive, facade) {
  consumeVaultFacade(archive, facade);
  const out = createVaultFacade(archive);
  return out;
}

const App = () => {
  const [vaultManager, setVaultManager] = useState(null);
  const [archiveFacade, setArchiveFacade] = useState(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState({});
  const deleteAttachment = useCallback(
    async (entryID, attachmentID) => {
      const source = vaultManager.sources[0];
      const entry = source.vault.findEntryByID(entryID);
      await source.attachmentManager.removeAttachment(entry, attachmentID);
      setArchiveFacade(createArchiveFacade(source.vault));
    },
    [attachmentPreviews, vaultManager]
  );
  const downloadAttachment = useCallback(
    async (entryID, attachmentID) => {
      const source = vaultManager.sources[0];
      const entry = source.vault.findEntryByID(entryID);
      const attachmentDetails = await source.attachmentManager.getAttachmentDetails(
        entry,
        attachmentID
      );
      const attachmentData = await source.attachmentManager.getAttachment(
        entry,
        attachmentID
      );
      // Download
      const blob = new Blob([attachmentData], { type: attachmentDetails.type });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = attachmentDetails.name;
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        document.body.removeChild(anchor);
      }, 0);
    },
    [vaultManager]
  );
  const previewAttachment = useCallback(
    async (entryID, attachmentID) => {
      if (attachmentPreviews[attachmentID]) return;
      const source = vaultManager.sources[0];
      const entry = source.vault.findEntryByID(entryID);
      const attachmentData = await source.attachmentManager.getAttachment(
        entry,
        attachmentID
      );
      setAttachmentPreviews({
        ...attachmentPreviews,
        [attachmentID]: arrayBufferToBase64(attachmentData)
      });
    },
    [attachmentPreviews, vaultManager]
  );
  useEffect(() => {
    async function createVaultManager() {
      setDefaultFormat(VaultFormatB);
      const manager = new VaultManager();
      const creds = Credentials.fromDatasource(
        {
          type: 'memory',
          property: 'test'
        },
        'test'
      );
      const credStr = await creds.toSecureString();
      const source = new VaultSource('test', 'memory', credStr);
      await manager.addSource(source);
      await source.unlock(Credentials.fromPassword('test'), {
        initialiseRemote: true
      });
      const { vault } = source;
      await createArchive(vault, source);
      await source.save();
      setVaultManager(manager);
      setArchiveFacade(createArchiveFacade(vault));
    }
    createVaultManager();
  }, []);

  return (
    <ThemeProvider theme={themes.dark}>
      <div style={{ height: '100vh' }} className="bp3-dark">
        {archiveFacade && (
          <VaultProvider
            vault={archiveFacade}
            attachments
            attachmentPreviews={attachmentPreviews}
            onAddAttachments={async (entryID, files) => {
              const source = vaultManager.sources[0];
              const entry = source.vault.findEntryByID(entryID);
              for (const file of files) {
                const buff = await file.arrayBuffer();
                await source.attachmentManager.setAttachment(
                  entry,
                  AttachmentManager.newAttachmentID(),
                  buff,
                  file.name,
                  file.type || 'application/octet-stream'
                );
              }
              setArchiveFacade(createVaultFacade(source.vault));
            }}
            onDeleteAttachment={deleteAttachment}
            onDownloadAttachment={downloadAttachment}
            onPreviewAttachment={previewAttachment}
            onUpdate={vaultFacade => {
              console.log('Saving vault...');
              const source = vaultManager.sources[0];
              setArchiveFacade(processVaultUpdate(source.vault, vaultFacade));
            }}
          >
            <VaultUI />
          </VaultProvider>
        )}
      </div>
    </ThemeProvider>
  );
};

export default hot(App);
