import React from 'react';

import { WModal, WMHeader, WMMain, WButton } from 'wt-frontend';

const Delete = (props) => {

    const handleDelete = async () => {
        props.deleteList(props.activeid);
        props.setShowDelete(false);
    }

    return (
        <WModal className="delete-modal" visible={true} cover={true} animation="slide-fade-top">
            
            <div className="modal-header" onClose={() => props.setShowDelete(false)}>
                <WMHeader onClose={() => props.setShowDelete(false)}>
                Delete List?
                </WMHeader>
			</div>
            


            <div>           
                <WButton className="modal-button cancel-button" onClick={() => props.setShowDelete(false)} wType="texted">
                    Cancel
				</WButton>
                <WButton className="modal-button" onClick={handleDelete} clickAnimation="ripple-light" hoverAnimation="darken" shape="rounded" color="danger">
                    Delete
				</WButton>
            </div>
            

        </WModal>
    );
}

export default Delete;