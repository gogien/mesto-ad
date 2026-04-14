const BASE_URL = 'https://mesto.nomoreparties.co/v1/apf-cohort-203';

const HEADERS = {
  authorization: '8172f15f-f678-4a3b-a8a0-d662c67c65e8',
  'Content-Type': 'application/json',
};

const getResponseData = (res) => res.ok ? res.json() : Promise.reject(`Error: ${res.status}`);

export const getUserInfo = () => {
  return fetch(`${BASE_URL}/users/me`, {
    headers: HEADERS,
  }).then(getResponseData);
};

export const getCardList = () => {
  return fetch(`${BASE_URL}/cards`, {
    headers: HEADERS,
  }).then(getResponseData);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ name, about }),
  }).then(getResponseData);
};

export const updateAvatar = (avatarUrl) => {
  return fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ avatar: avatarUrl }),
  }).then(getResponseData);
};

export const addCard = ({ name, link }) => {
  return fetch(`${BASE_URL}/cards`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name, link }),
  }).then(getResponseData);
};

export const deleteCard = (cardId) => {
  return fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'DELETE',
    headers: HEADERS,
  }).then(getResponseData);
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch(`${BASE_URL}/cards/likes/${cardId}`, {
    method: isLiked ? 'DELETE' : 'PUT',
    headers: HEADERS,
  }).then(getResponseData);
};
