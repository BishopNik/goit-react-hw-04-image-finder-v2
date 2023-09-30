/** @format */

import { BsFillCaretDownSquareFill } from 'react-icons/bs';
import Button from '../button';

function Pagination({ page, countPage, foundImages, onClickChangePage }) {
	return (
		<div className='status-container'>
			{page > 0 && countPage > 0 && (
				<div className='status-container'>
					<div className='page-stat'>
						<div className='page-count'>View images: {foundImages.length}</div>
					</div>
					{countPage > 1 && (
						<Button className={'loadmore'} type={'button'} onClick={onClickChangePage}>
							<BsFillCaretDownSquareFill />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

export default Pagination;
