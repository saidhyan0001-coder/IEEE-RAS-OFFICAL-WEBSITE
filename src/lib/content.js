import { apiRequest } from './api';

const contentCategories = ['about', 'boards', 'societies', 'team', 'gallery', 'events', 'announcements'];

export async function fetchPublishedContent(category) {
  const result = await apiRequest(`content?category=${encodeURIComponent(category)}`);
  return result.items;
}

export async function submitJoinRequest({ name, email, message }) {
  await apiRequest('contact', {
    method: 'POST',
    body: JSON.stringify({ name, email, message }),
  });
}

export async function createContentEntry(entry) {
  return apiRequest('content', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function updateContentPublished(id, published) {
  await apiRequest('content', {
    method: 'PATCH',
    body: JSON.stringify({ id, published }),
  });
}

export async function updateContentEntry(entry) {
  return apiRequest('content', {
    method: 'PATCH',
    body: JSON.stringify(entry),
  });
}

export async function deleteContentEntry(id) {
  await apiRequest('content', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

async function uploadImage(file, key) {
  const encoded = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
  const result = await apiRequest('branding', {
    method: 'POST',
    body: JSON.stringify({
      key,
      fileName: file.name,
      contentType: file.type,
      data: encoded,
    }),
  });
  return result.url;
}

export async function uploadPublicImage(file) {
  return uploadImage(file, 'content');
}

export async function uploadBrandingAsset(file, key) {
  await uploadImage(file, key);
}

export async function fetchAdminContent() {
  const results = await Promise.all(contentCategories.map((category) =>
    apiRequest(`content?category=${category}&admin=1`)));
  return results.flatMap((result) => result.items);
}

export async function fetchJoinRequests() {
  const result = await apiRequest('contact');
  return result.requests;
}

export async function updateJoinRequestStatus(id, status) {
  await apiRequest('contact', {
    method: 'PATCH',
    body: JSON.stringify({ id, status }),
  });
}
