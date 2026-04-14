import { getUserInfo, getCardList, setUserInfo, updateAvatar, addCard, deleteCard, changeLikeCardStatus } from './components/api.js';
import { createCardElement } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
};

// DOM — profile
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');
const openProfileFormButton = document.querySelector('.profile__edit-button');
const openCardFormButton = document.querySelector('.profile__add-button');

// DOM — profile edit modal
const profileFormModalWindow = document.querySelector('.popup_type_edit');
const profileForm = profileFormModalWindow.querySelector('.popup__form');
const profileTitleInput = profileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = profileForm.querySelector('.popup__input_type_description');

// DOM — new card modal
const cardFormModalWindow = document.querySelector('.popup_type_new-card');
const cardForm = cardFormModalWindow.querySelector('.popup__form');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

// DOM — image preview modal
const imageModalWindow = document.querySelector('.popup_type_image');
const imageElement = imageModalWindow.querySelector('.popup__image');
const imageCaption = imageModalWindow.querySelector('.popup__caption');

// DOM — avatar edit modal
const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarFormModalWindow.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

// DOM — delete confirmation modal
const deleteCardModalWindow = document.querySelector('.popup_type_remove-card');
const deleteCardForm = deleteCardModalWindow.querySelector('.popup__form');

// DOM — stats modal
const infoModalWindow = document.querySelector('.popup_type_info');
const infoStatsList = infoModalWindow.querySelector('.popup__info');
const infoUsersList = infoModalWindow.querySelector('.popup__list');

// DOM — cards list & logo
const placesWrap = document.querySelector('.places__list');
const logo = document.querySelector('.header__logo');

// State
let currentUserId = null;
let currentCards = [];
let pendingDeleteCardElement = null;
let pendingDeleteCardId = null;

// ─── Helpers ────────────────────────────────────────────────────────────────

const renderLoading = (button, isLoading, loadingText = 'Сохранение...') => {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText;
    button.disabled = false;
  }
};

// ─── Card handlers ───────────────────────────────────────────────────────────

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardElement, cardId) => {
  pendingDeleteCardElement = cardElement;
  pendingDeleteCardId = cardId;
  openModalWindow(deleteCardModalWindow);
};

const handleLikeCard = (cardId, likeButton, likeCountElement, isLiked) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      const newIsLiked = updatedCard.likes.some((user) => user._id === currentUserId);
      likeButton.classList.toggle('card__like-button_is-active', newIsLiked);
      likeCountElement.textContent = updatedCard.likes.length;
      currentCards = currentCards.map((card) => (card._id === cardId ? updatedCard : card));
    })
    .catch(console.error);
};

const renderCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onDeleteCard: handleDeleteCard,
    onLikeCard: handleLikeCard,
  });
};

// ─── Stats modal ─────────────────────────────────────────────────────────────

const renderStats = (cards) => {
  const defTemplate = document.getElementById('popup-info-definition-template');
  const userTemplate = document.getElementById('popup-info-user-preview-template');

  infoStatsList.textContent = '';
  infoUsersList.textContent = '';

  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);
  const topCard = cards.length > 0
    ? cards.reduce((max, card) => (card.likes.length > max.likes.length ? card : max))
    : null;

  [
    { term: 'Всего карточек', description: String(cards.length) },
    { term: 'Всего лайков', description: String(totalLikes) },
    { term: 'Самая популярная', description: topCard ? `${topCard.name} (${topCard.likes.length})` : '—' },
  ].forEach(({ term, description }) => {
    const item = defTemplate.content.cloneNode(true);
    item.querySelector('.popup__info-term').textContent = term;
    item.querySelector('.popup__info-description').textContent = description;
    infoStatsList.appendChild(item);
  });

  const authorMap = cards.reduce((acc, card) => {
    const name = card.owner.name;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  Object.entries(authorMap)
    .sort(([, a], [, b]) => b - a)
    .forEach(([name, count]) => {
      const item = userTemplate.content.cloneNode(true);
      item.querySelector('.popup__list-item').textContent = `${name} (${count})`;
      infoUsersList.appendChild(item);
    });
};

// ─── Form submit handlers ────────────────────────────────────────────────────

profileForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const button = profileForm.querySelector('.popup__button');
  renderLoading(button, true);

  setUserInfo({ name: profileTitleInput.value, about: profileDescriptionInput.value })
    .then((user) => {
      profileTitle.textContent = user.name;
      profileDescription.textContent = user.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch(console.error)
    .finally(() => renderLoading(button, false));
});

avatarForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const button = avatarForm.querySelector('.popup__button');
  renderLoading(button, true);

  updateAvatar(avatarInput.value)
    .then((user) => {
      profileAvatar.style.backgroundImage = `url(${user.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch(console.error)
    .finally(() => renderLoading(button, false));
});

cardForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const button = cardForm.querySelector('.popup__button');
  renderLoading(button, true, 'Создание...');

  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      currentCards = [newCard, ...currentCards];
      placesWrap.prepend(renderCard(newCard));
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch(console.error)
    .finally(() => renderLoading(button, false));
});

deleteCardForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const button = deleteCardForm.querySelector('.popup__button');
  renderLoading(button, true, 'Удаление...');

  deleteCard(pendingDeleteCardId)
    .then(() => {
      pendingDeleteCardElement.remove();
      currentCards = currentCards.filter((card) => card._id !== pendingDeleteCardId);
      closeModalWindow(deleteCardModalWindow);
    })
    .catch(console.error)
    .finally(() => {
      renderLoading(button, false);
      pendingDeleteCardElement = null;
      pendingDeleteCardId = null;
    });
});

// ─── Open modal handlers ─────────────────────────────────────────────────────

openProfileFormButton.addEventListener('click', () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

logo.addEventListener('click', () => {
  renderStats(currentCards);
  openModalWindow(infoModalWindow);
});

// ─── Init ────────────────────────────────────────────────────────────────────

document.querySelectorAll('.popup').forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
  popup.classList.add('popup_is-animated');
});

enableValidation(validationConfig);

Promise.all([getUserInfo(), getCardList()])
  .then(([user, cards]) => {
    currentUserId = user._id;
    currentCards = cards;

    profileTitle.textContent = user.name;
    profileDescription.textContent = user.about;
    profileAvatar.style.backgroundImage = `url(${user.avatar})`;

    cards.forEach((card) => {
      placesWrap.append(renderCard(card));
    });
  })
  .catch(console.error);
