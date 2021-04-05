import React                    from 'react';
import { WButton, WRow, WCol }  from 'wt-frontend';

const SidebarHeader = (props) => {
    
    const buttonStyle = !props.activeList._id ? "sidebar-buttons" : "sidebar-buttons-disabled" ;
    const clickDisabled = () => { };
    return (
        <WRow className='sidebar-header'>
            <WCol size="7">
                <WButton wType="texted" hoverAnimation="text-primary" className='sidebar-header-name'>
                    Todolists
                </WButton>
            </WCol>

            <WCol size="5">
                {
                    props.auth && <div className="sidebar-options">
                        <WButton className={`${buttonStyle}`} onClick={!props.activeList._id ? props.createNewList : clickDisabled} clickAnimation="ripple-light" shape="rounded" color={!props.activeList._id ? "primary" : "colored"}>
                            <i className="material-icons">add</i>
                        </WButton>
                        
                    </div>
                }
            </WCol>

        </WRow>

    );
};

export default SidebarHeader;