/** @format */

import { useEffect, useState } from 'react';
import { BsFillCaretDownSquareFill } from 'react-icons/bs';
import { Notify } from 'notiflix';
import { nanoid } from 'nanoid';
import { fetchImage } from './service/fetch_api';
import Searchbar from './searchbar';
import Gallery from './gallery';
import Modal from './modal';
import Button from './button';
import Loader from './loader';
import ErrorComponent from './service/error';

import './style.css';

function App() {
	const [searchItem, setSearchItem] = useState('');
	const [newSearch, setNewSearch] = useState(null);
	const [isModalShow, setIsModalShow] = useState(false);
	const [bigImgShow, setBigImgShow] = useState('');
	const [page, setPage] = useState(-1);
	const [perPage] = useState(20);
	const [foundImages, setFoundImages] = useState([]);
	const [countPage, setCountPage] = useState(0);
	const [statusComponent, setStatusComponent] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (page <= 1) {
			return;
		}
		scrollWindow();
	}, [foundImages, page]);

	useEffect(() => {
		if ((!searchItem && page === 1) || page === -1) {
			return;
		}

		setStatusComponent('pending');

		fetchImage({
			searchItem,
			page,
			perPage,
		})
			.then(({ hits, totalHits }) => {
				const images = [];
				hits.forEach(({ id, webformatURL, largeImageURL, tags }) => {
					if (id && webformatURL && largeImageURL && tags) {
						images.push({ id, webformatURL, largeImageURL, tags });
					}
				});

				setFoundImages([...foundImages, ...images]);
				console.log(images);
				if (page === 1) {
					setCountPage(Math.ceil(totalHits / perPage));
				}
				setStatusComponent('resolved');
			})
			.catch(({ message }) => {
				setStatusComponent('rejected');
				setError(message);
				Notify.failure('Unable to load results. ' + message);
			});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, searchItem, newSearch]);

	function scrollWindow() {
		window.scrollBy({
			top: 500,
			behavior: 'smooth',
		});
	}

	const handlerChangeSearchValue = value => {
		setSearchItem(value);
		setPage(1);
		setFoundImages([]);
		setCountPage(0);
		setError(null);
		setNewSearch(nanoid());
	};

	const handleClick = bigImageSrc => {
		setIsModalShow(true);
		setBigImgShow(bigImageSrc);
	};

	const handlerCloseModal = () => {
		setIsModalShow(false);
	};

	return (
		<div className='container'>
			{isModalShow && (
				<Modal onClose={handlerCloseModal}>
					<img src={bigImgShow} alt='Big Search Element' />
				</Modal>
			)}
			<Searchbar handlerSearch={handlerChangeSearchValue} />

			{statusComponent === 'pending' && <Loader />}

			{statusComponent !== 'rejected' && (
				<>
					{foundImages.length > 0 ? (
						<>
							<Gallery images={foundImages} onClick={handleClick} />
							<div className='status-container'>
								{page > 0 && countPage > 0 && (
									<div className='status-container'>
										<div className='page-stat'>
											<div className='page-count'>
												View images: {foundImages.length}
											</div>
										</div>
										{countPage > 1 && (
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
							</div>
						</>
					) : (
						statusComponent === 'resolved' &&
						page !== -1 && (
							<>
								<ErrorComponent>
									Images <span className='search-item'>{searchItem}</span> not
									found
								</ErrorComponent>
							</>
						)
					)}
				</>
			)}

			{statusComponent === 'rejected' && (
				<ErrorComponent className={'error'}>{error}</ErrorComponent>
			)}
		</div>
	);
}

export default App;
