import log from 'electron-log';
import omit from 'lodash/omit';
import iconographer from '../../main/lib/icon/iconographer';
import i18n from '../i18n';
import { getArchive, saveWorkspace } from './archive';
import {
  Vault,
  consumeEntryFacade,
  createEntryFacade,
  fieldsToProperties,
  getEntryURLs
} from './buttercup';

function entryToObj(entry) {
  const facade = createEntryFacade(entry);
  return {
    id: entry.id,
    facade,
    isInTrash: entry.isInTrash()
  };
}

export function getFacadeFieldValue(entry, fieldName) {
  const field = entry.facade.fields.find(
    field => field.property === fieldName && field.propertyType === 'property'
  );
  if (field) {
    return field.value;
  }
}

export function getEntryURL(entry) {
  const fields = entry.facade
    ? entry.facade.fields
    : entryToObj(entry).facade.fields;
  const props = fieldsToProperties(fields);
  const [url] = getEntryURLs(props);
  return url || null;
}

export function getParentGroups(currentGroup) {
  return currentGroup
    ? [...getParentGroups(currentGroup.getParentGroup()), currentGroup]
    : [];
}

/**
 * Validate buttercup entry values
 * @param {ButtercupEntry} entry
 */
export function validateEntry(entry) {
  const errorMessages = [];
  const fields = entry.facade.fields;

  if (!Array.isArray(fields) || fields.length === 0) {
    errorMessages.push(i18n.t('entry.entry-inputs-empty-info'));
  } else {
    const title = getFacadeFieldValue(entry, 'title');

    if (!title) {
      errorMessages.push(i18n.t('entry.entry-title-empty-info'));
    }

    if (fields.filter(field => !field.property).length > 0) {
      errorMessages.push(i18n.t('entry.custom-fields-label-empty-info'));
    }

    const fieldKeys = fields.reduce((output, field) => {
      if (field.propertyType === 'property') {
        output.push(field.property);
      }
      return output;
    }, []);

    if (fieldKeys.length !== [...new Set(fieldKeys)].length) {
      errorMessages.push(i18n.t('entry.custom-fields-label-duplicate'));
    }
  }

  if (errorMessages.length > 0) {
    throw new Error(errorMessages.join('\n'));
  }

  return entry;
}

// @TODO: Add entry type when we take facades into use
export function createNewEntryStructure() {
  const vault = new Vault();
  const group = vault.createGroup('temp');
  const entry = entryToObj(group.createEntry());
  return omit(entry, 'id');
}

export function loadEntries(archiveId, groupId) {
  const arch = getArchive(archiveId);
  const group = arch.findGroupByID(groupId);

  if (!group) {
    throw new Error(i18n.t('error.group-not-found'));
  }

  const entries = group.getEntries();

  return Promise.all(
    entries.map(async entry => {
      const entryObject = entryToObj(entry);
      // Here we get only the available icons in disk.
      // Downloading missing icons is a lot slower, we do it later, after loading the entries.
      const icon = await getIcon(entry);
      return {
        ...entryObject,
        icon: icon || null
      };
    })
  );
}

export function updateEntry(archiveId, entryObj) {
  const arch = getArchive(archiveId);
  const entry = arch.findEntryByID(entryObj.id);

  if (!entry) {
    throw new Error(i18n.t('error.entry-not-found'));
  }

  const { facade } = validateEntry(entryObj);

  consumeEntryFacade(entry, facade);
  saveWorkspace(archiveId);

  return entryToObj(entry);
}

export async function updateEntryIcon(archiveId, entryId) {
  const arch = getArchive(archiveId);
  const entry = arch.findEntryByID(entryId);

  if (!entry) {
    throw new Error(i18n.t('error.entry-not-found'));
  }

  const entryObj = entryToObj(entry);
  const icon = await getOrDownloadIcon(entry);
  if (icon) {
    entryObj.icon = icon;
  }

  return entryObj;
}

async function getOrDownloadIcon(entry) {
  // We move on whether this succeeds or not
  // TODO Should maybe log it somewhere (but not alert the user - not an error)
  let icon = await getIcon(entry);
  if (!icon) {
    await processIcon(entry);
    icon = await getIcon(entry);
  }
  return icon;
}

async function processIcon(entry) {
  try {
    await iconographer.processIconForEntry(entry);
  } catch (err) {
    // ENOTFOUND or ECONNREFUSED means the URL is just invalid, not an error
    if (!['ENOTFOUND', 'ECONNREFUSED'].includes(err.code)) {
      log.error('Unable to process icon for entry', err);
    }
  }
}

export async function getIcon(entry) {
  entry.getMeta = () => getEntryURL(entry);

  try {
    const iconContents = await iconographer.getIconForEntry(entry);
    if (iconContents) {
      return iconContents.toString();
    }
  } catch (err) {
    log.error('Unable to get icon for entry', err);
  }

  return null;
}

export function createEntry(archiveId, groupId, newValues) {
  const arch = getArchive(archiveId);
  const group = arch.findGroupByID(groupId);

  if (!group) {
    throw new Error(i18n.t('error.group-not-found'));
  }

  const { facade } = validateEntry(newValues);
  const entry = group.createEntry();

  consumeEntryFacade(entry, facade);
  saveWorkspace(archiveId);

  return entryToObj(entry);
}

export function deleteEntry(archiveId, entryId) {
  const arch = getArchive(archiveId);
  const entry = arch.findEntryByID(entryId);

  if (!entry) {
    throw new Error(i18n.t('error.entry-not-found'));
  }

  entry.delete();
  saveWorkspace(archiveId);
}

export function moveEntry(archiveId, entryId, groupId) {
  const arch = getArchive(archiveId);
  const entry = arch.findEntryByID(entryId);
  const group = arch.findGroupByID(groupId);

  if (!entry || !group) {
    throw new Error(i18n.t('error.entry-not-found'));
  }

  entry.moveToGroup(group);
  saveWorkspace(archiveId);
}
