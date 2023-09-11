/** @format */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { BsFillCaretDownSquareFill } from 'react-icons/bs';
import { Notify } from 'notiflix';
import { fetchImage } from '../service/fetch_api';
import ImageItem from '../galleryitem';
import Button from '../button';
import Loader from '../loader';
import ErrorComponent from '../service/error';
import './style.css';

function ImageGallery({ searchItem, isNewSearch, onClickBigImage, onSearchCompeted }) {
	const [page, setPage] = useState(null);
	const [perPage] = useState(20);
	const [foundImages, setFoundImages] = useState([]);
	const [countFoundItem, setCountFoundItem] = useState(0);
	const [countPage, setCountPage] = useState(0);
	const [statusComponent, setStatusComponent] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!searchItem || !isNewSearch) {
			return;
		}
		setPage(0);
		setFoundImages([]);
		setCountFoundItem(0);
		setCountPage(0);
		setError(null);
	}, [isNewSearch, searchItem]);

	useEffect(() => {
		if (page === 1) {
			return;
		}
		scrollWindow();
	}, [foundImages, page]);

	useEffect(() => {
		if (isNewSearch) {
			setPage(1);
		}
		if (!searchItem || !page) {
			return;
		}

		setStatusComponent('pending');

		fetchImage({
			searchItem,
			page: isNewSearch ? 1 : page,
			perPage,
		})
			.then(({ hits, totalHits }) => {
				const images = [];
				hits.forEach(({ id, webformatURL, largeImageURL, tags }) => {
					if (id && webformatURL && largeImageURL && tags) {
						images.push({ id, webformatURL, largeImageURL, tags });
					}
				});

				setFoundImages(isNewSearch ? [...images] : [...foundImages, ...images]);
				if (page === 1) {
					setCountFoundItem(totalHits);
					setCountPage(isNewSearch ? Math.ceil(totalHits / perPage) : countPage);
				}
				setStatusComponent('resolved');
			})
			.catch(({ message }) => {
				setStatusComponent('rejected');
				setError(message);
				Notify.failure('Unable to load results. ' + message);
			})
			.finally(onSearchCompeted);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	function scrollWindow() {
		window.scrollBy({
			top: 500,
			behavior: 'smooth',
		});
	}

	if (statusComponent !== 'rejected') {
		return (
			<>
				<ul className='gallery-container'>
					{foundImages.length > 0
						? foundImages.map(item => (
								<ImageItem
									key={item.id}
									srcUrl={item.webformatURL}
									dataset={item.largeImageURL}
									tags={item.tags}
									onClick={({ target }) =>
										onClickBigImage(target.dataset.largeurl)
									}
								/>
						  ))
						: searchItem !== '' &&
						  foundImages.length === 0 &&
						  statusComponent === 'resolved' && (
								<ErrorComponent>
									Images <span className='search-item'>{searchItem}</span> not
									found
								</ErrorComponent>
						  )}
				</ul>
				{page > 0 && countPage > 0 && foundImages.length > 0 && (
					<div className='status-container'>
						<div className='page-stat'>
							<div className='page-count'>Total images: {countFoundItem}</div>
						</div>
						<div className='page-stat'>
							<div className='page-count'>View images: {foundImages.length}</div>
						</div>
						{countPage > page && (
							<Button
								className={'loadmore'}
								type={'button'}
								onClick={() => {
									if (page < perPage) {
										setPage(page => page + 1);
									} else Notify.info('Last page');
								}}
							>
								<BsFillCaretDownSquareFill />
							</Button>
						)}
					</div>
				)}
				{statusComponent === 'pending' ? <Loader /> : null};
			</>
		);
	}

	if (statusComponent === 'rejected') {
		return <ErrorComponent className={'error'}>{error}</ErrorComponent>;
	}
}

ImageGallery.propTypes = {
	searchItem: PropTypes.string.isRequired,
	isNewSearch: PropTypes.bool.isRequired,
	onClickBigImage: PropTypes.func.isRequired,
	onSearchCompeted: PropTypes.func.isRequired,
};

export default ImageGallery;
