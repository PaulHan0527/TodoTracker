import React            from 'react';
import TableHeader      from './TableHeader';
import TableContents    from './TableContents';

const MainContents = (props) => {
    
    

    return (
        <div className='table ' >
            <TableHeader
                disabled={!props.activeList._id} addItem={props.addItem}
                setShowDelete={props.setShowDelete} setActiveList={props.setActiveList}
                undo={props.undo} redo={props.redo} 
                closeList={props.closeList}
                tps={props.tps} activeList={props.activeList}
                sortItem={props.sortItem}
                hasUndo={props.hasUndo}
                hasRedo={props.hasRedo}

            />
            <TableContents
                key={props.activeList.id} activeList={props.activeList}
                deleteItem={props.deleteItem} reorderItem={props.reorderItem}
                editItem={props.editItem}
                
            />
        </div>
    );
};

export default MainContents;