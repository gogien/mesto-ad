const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCardElement = (cardData, userId, { onPreviewPicture, onDeleteCard, onLikeCard }) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  const cardImage = cardElement.querySelector('.card__image');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector('.card__title').textContent = cardData.name;

  likeCountElement.textContent = cardData.likes.length;

  const isLiked = cardData.likes.some((like) => like._id === userId);
  likeButton.classList.toggle('card__like-button_is-active', isLiked);

  if (cardData.owner._id === userId) {
    deleteButton.addEventListener('click', () => {
      onDeleteCard(cardElement, cardData._id);
    });
  } else {
    deleteButton.remove();
  }

  likeButton.addEventListener('click', () => {
    onLikeCard(
      cardData._id,
      likeButton,
      likeCountElement,
      likeButton.classList.contains('card__like-button_is-active')
    );
  });

  cardImage.addEventListener('click', () => {
    onPreviewPicture({ name: cardData.name, link: cardData.link });
  });

  return cardElement;
};
