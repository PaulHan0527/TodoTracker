import React from 'react';

import { WButton, WRow, WCol } from 'wt-frontend';

const TableHeader = (props) => {

    const buttonStyle = props.disabled ? ' table-header-button-disabled ' : 'table-header-button ';
    const tps = props.tps;
    const undoDisable = tps.hasTransactionToUndo() ? 'table-header-button' : 'table-header-button-disabled';
    const redoDisable = tps.hasTransactionToRedo() ? 'table-header-button' : 'table-header-button-disabled';
    const clickDisabled = () => { };

    const handleTaskClick = () => {
        if (props.activeList.items.length > 0 ) {
            props.sortItem(1);
        }
    }

    const handleAssignedToClick = () => {
        if (props.activeList.items.length > 0 ) {
            props.sortItem(4);
        }
    }

    const handleStatusClick = () => {
        if (props.activeList.items.length > 0 ) {
            props.sortItem(3);
        }
    }

    const handleDateClick = () => {
        if (props.activeList.items.length > 0 ) {
            props.sortItem(2);
        }
    }


    return (
        <WRow className="table-header">
            <WCol size="3">
                <WButton className='table-header-section' onClick={props.disabled ? clickDisabled : handleTaskClick } wType="texted" >Task</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' onClick={props.disabled ? clickDisabled : handleDateClick } wType="texted">Due Date</WButton>
            </WCol>

            <WCol size="2">
                <WButton className='table-header-section' onClick={props.disabled ? clickDisabled : handleStatusClick } wType="texted" >Status</WButton>
            </WCol>
            <WCol size="2">
                <WButton className='table-header-section' onClick={props.disabled ? clickDisabled : handleAssignedToClick } wType="texted" >Assigned To</WButton>
            </WCol>

            <WCol size="3">
                <div className="table-header-buttons">
                    <WButton className={`${undoDisable}`} onClick={tps.hasTransactionToUndo() ? props.undo : clickDisabled} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">undo</i>
                    </WButton>
                    <WButton className={`${redoDisable}`} onClick={tps.hasTransactionToRedo() ? props.redo : clickDisabled} wType="texted" clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">redo</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.addItem} wType="texted" className={`${buttonStyle}`} clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">add_box</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : props.setShowDelete} wType="texted" className={`${buttonStyle}`} clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">delete_outline</i>
                    </WButton>
                    <WButton onClick={props.disabled ? clickDisabled : () => props.closeList()} wType="texted" className={`${buttonStyle}`} clickAnimation="ripple-light" shape="rounded">
                        <i className="material-icons">close</i>
                    </WButton>
                </div>
            </WCol>

        </WRow>
    );
};

export default TableHeader;