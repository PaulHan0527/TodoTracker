import React, { useState, useEffect } from 'react';
import Logo from '../navbar/Logo';
import NavbarOptions from '../navbar/NavbarOptions';
import MainContents from '../main/MainContents';
import SidebarContents from '../sidebar/SidebarContents';
import Login from '../modals/Login';
import Delete from '../modals/Delete';
import CreateAccount from '../modals/CreateAccount';
import { GET_DB_TODOS } from '../../cache/queries';
import * as mutations from '../../cache/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { WNavbar, WSidebar, WNavItem } from 'wt-frontend';
import { WLayout, WLHeader, WLMain, WLSide } from 'wt-frontend';
import {
	UpdateListField_Transaction,
	UpdateListItems_Transaction,
	ReorderItems_Transaction,
	EditItem_Transaction,
	SortItems_Transaction
} from '../../utils/jsTPS';
import WInput from 'wt-frontend/build/components/winput/WInput';
import { defaultPlaygroundOptions } from 'apollo-server-core';


const Homescreen = (props) => {

	let todolists = [];
	const [activeList, setActiveList] = useState({});
	const [showDelete, toggleShowDelete] = useState(false);
	const [showLogin, toggleShowLogin] = useState(false);
	const [showCreate, toggleShowCreate] = useState(false);
	const [hasUndo, toggleHasUndo] = useState(false);
	const [hasRedo, toggleHasRedo] = useState(false);

	const [ReorderTodoItems] = useMutation(mutations.REORDER_ITEMS);
	const [UpdateTodoItemField] = useMutation(mutations.UPDATE_ITEM_FIELD);
	const [UpdateTodolistField] = useMutation(mutations.UPDATE_TODOLIST_FIELD);
	const [DeleteTodolist] = useMutation(mutations.DELETE_TODOLIST);
	const [DeleteTodoItem] = useMutation(mutations.DELETE_ITEM);
	const [AddTodolist] = useMutation(mutations.ADD_TODOLIST);
	const [AddTodoItem] = useMutation(mutations.ADD_ITEM);
	const [SortItem] = useMutation(mutations.SORT_ITEMS);


	const { loading, error, data, refetch } = useQuery(GET_DB_TODOS);
	if (loading) { console.log(loading, 'loading'); }
	if (error) { console.log(error, 'error'); }
	if (data) { todolists = data.getAllTodos; }

	const auth = props.user === null ? false : true;

	const refetchTodos = async (refetch) => {
		const { loading, error, data } = await refetch();
		if (data) {
			todolists = data.getAllTodos;
			if (activeList._id) {
				let tempID = activeList._id;
				let list = todolists.find(list => list._id === tempID);
				setActiveList(list);
			}
		}
	}

	const tpsUndo = async () => {
		const retVal = await props.tps.undoTransaction();
		refetchTodos(refetch);
		if(retVal) {
			toggleHasRedo(props.tps.hasTransactionToRedo());
			toggleHasUndo(props.tps.hasTransactionToUndo());
		}
		return retVal;
	}

	const tpsRedo = async () => {
		const retVal = await props.tps.doTransaction();
		refetchTodos(refetch);
		if(retVal) {
			toggleHasRedo(props.tps.hasTransactionToRedo());
			toggleHasUndo(props.tps.hasTransactionToUndo());
		}
		return retVal;
	}


	// Creates a default item and passes it to the backend resolver.
	// The return id is assigned to the item, and the item is appended
	//  to the local cache copy of the active todolist. 
	const addItem = async () => {
		let list = activeList;
		const items = list.items;
		const ids = items.map(item => item.id);
		let maxId = 0;
		for(let i = 0; i < ids.length; i++) {
			if(ids[i] >= maxId) {
				maxId = ids[i];
			}
		}
		
		const lastID = items.length >= 1 ? maxId + 1 : 0;
		const newItem = {
			_id: '',
			id: lastID,
			description: 'No Description',
			due_date: 'No Date',
			assigned_to: 'Not Assigned',
			completed: false
		};
		// props.user._id to access _id
		let opcode = 1;
		let itemID = newItem._id;
		let listID = activeList._id;
		let transaction = new UpdateListItems_Transaction(listID, itemID, newItem, opcode, AddTodoItem, DeleteTodoItem);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};


	const deleteItem = async (item, index) => {
		let listID = activeList._id;
		let itemID = item._id;
		let opcode = 0;
		let itemToDelete = {
			_id: item._id,
			id: item.id,
			description: item.description,
			due_date: item.due_date,
			assigned_to: item.assigned_to,
			completed: item.completed
		}
		let transaction = new UpdateListItems_Transaction(listID, itemID, itemToDelete, opcode, AddTodoItem, DeleteTodoItem, index);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	const editItem = async (itemID, field, value, prev) => {
		let flag = 0;
		if (field === 'completed') flag = 1;
		let listID = activeList._id;
		let transaction = new EditItem_Transaction(listID, itemID, field, prev, value, flag, UpdateTodoItemField);
		props.tps.addTransaction(transaction);
		tpsRedo();

	};

	const reorderItem = async (itemID, dir) => {
		let listID = activeList._id;
		let transaction = new ReorderItems_Transaction(listID, itemID, dir, ReorderTodoItems);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	

	const sortItem = async (opcode) => {
		let listID = activeList._id;
		let oldList = [];
		
		for(let i = 0; i < activeList.items.length; i++) {
				oldList[i] = {};
				oldList[i]._id = activeList.items[i]._id;
				oldList[i].id = activeList.items[i].id;
				oldList[i].description = activeList.items[i].description;
				oldList[i].due_date = activeList.items[i].due_date;
				oldList[i].completed = activeList.items[i].completed;
				oldList[i].assigned_to = activeList.items[i].assigned_to;
		}
		let listItems = [];
		for(let i = 0; i < oldList.length; i ++ ) {
			listItems[i] = oldList[i];
		}
		if (opcode === 1) {
			// Description sort
			let sorted = true;
			for (let i = 0; i < listItems.length - 1; i++) {
				if (listItems[i].description > listItems[i + 1].description) {
					sorted = false;
					break;
				}
			}
			if (sorted) {
				listItems.reverse();
			} 
			else listItems.sort(function compare(a, b) {
				if (a.description < b.description) {
					return -1;
				}
				if (a.description > b.description) {
					return 1;
				}
				return 0
			});
		}
		else if (opcode === 2) {
			// Date Sort
			let sorted = true;
			for (let i = 0; i < listItems.length - 1; i++) {
				if (listItems[i].due_date > listItems[i + 1].due_date) {
					sorted = false;
					break;
				}
			}
			if (sorted) {
				listItems.reverse();
			} 
			else listItems.sort(function compare(a, b) {
				if (a.due_date < b.due_date) {
					return -1;
				}
				if (a.due_date > b.due_date) {
					return 1;
				}
				return 0
			});
		}
		else if (opcode === 3) {
			// status sort 
			let sorted = listItems[0].completed;
			if (sorted === false) {
				listItems.sort(function(x, y) {
					return (x.completed === y.completed) ? 0 : x.completed ? -1 : 1;
				});
			}
			else if (sorted === true) {
				listItems.sort(function(x, y) {
					return (x.completed === y.completed) ? 0 : x.completed ? 1 : -1;
				});
			}
			
		}
		else if (opcode === 4) {
			// assigned to sort 
			let sorted = true;

			for (let i = 0; i < listItems.length - 1; i++) {
				if (listItems[i].assigned_to > listItems[i + 1].assigned_to) {
					sorted = false;
					break;
				}
			}
			if (sorted) {
				listItems.reverse();
			} 
			else listItems.sort(function compare(a, b) {
				if (a.assigned_to < b.assigned_to) {
					return -1;
				}
				if (a.assigned_to > b.assigned_to) {
					return 1;
				}
				return 0
			});
		}
		
		let transaction = new SortItems_Transaction(listID, oldList, listItems, SortItem);
		props.tps.addTransaction(transaction);
		tpsRedo();
	};

	

	const createNewList = async () => {
		for(let i = 0; i < todolists.length; i++) {
			let listID = todolists[i]._id;
			await UpdateTodolistField({variables: {_id: listID , field: 'isTop', value : "b"}});
		}
		
		const length = todolists.length
		const id = length >= 1 ? todolists[length - 1].id + Math.floor((Math.random() * 100) + 1) : 1;
		let list = {
			_id: '',
			id: id,
			name: 'Untitled',
			owner: props.user._id,
			items: [],
			isTop: "a"
		}
		props.tps.clearAllTransactions();
		const { data } = await AddTodolist({ variables: { todolist: list }, refetchQueries: [{ query: GET_DB_TODOS }] });
		
		await refetchTodos(refetch);
		if (data) {
			let _id = data.addTodolist;
			let newList = todolists.find(list => list._id === _id);
			setActiveList(newList)
		}
		
	};
	
	const deleteList = async (_id) => {
		DeleteTodolist({ variables: { _id: _id }, refetchQueries: [{ query: GET_DB_TODOS }] });
		refetch();
		setActiveList({});
		props.tps.clearAllTransactions();
	};

	const updateListField = async (_id, field, value, prev) => {
		let transaction = new UpdateListField_Transaction(_id, field, prev, value, UpdateTodolistField);
		props.tps.addTransaction(transaction);
		tpsRedo();

	};

	const handleSetActive = (id) => {
		const todo = todolists.find(todo => todo.id === id || todo._id === id);
		for(let i = 0; i < todolists.length; i++) {
			if (todo._id === todolists[i]._id) {
				let listID = todolists[i]._id;
				UpdateTodolistField({variables: {_id: listID , field: 'isTop', value : "a"}});
			}
			else {
				let listID = todolists[i]._id;
				UpdateTodolistField({variables: {_id: listID , field: 'isTop', value : "b"}});
			}
		}
		refetch();
		setActiveList(todo);
		props.tps.clearAllTransactions();
		
	};

	const closeList = async () => {
		setActiveList({});
		props.tps.clearAllTransactions();
		toggleHasUndo(false);
		toggleHasRedo(false);
	};



	/*
		Since we only have 3 modals, this sort of hardcoding isnt an issue, if there
		were more it would probably make sense to make a general modal component, and
		a modal manager that handles which to show.
	*/
	const setShowLogin = () => {
		toggleShowDelete(false);
		toggleShowCreate(false);
		toggleShowLogin(!showLogin);
	};

	const setShowCreate = () => {
		toggleShowDelete(false);
		toggleShowLogin(false);
		toggleShowCreate(!showCreate);
	};

	const setShowDelete = () => {
		toggleShowCreate(false);
		toggleShowLogin(false);
		toggleShowDelete(!showDelete)
	}


	var shouldHandleKeyDown = true;
    document.onkeydown = function(event){
    	if (!shouldHandleKeyDown) return;
	  
		if(event.ctrlKey && event.key === 'z') {
			tpsUndo();
			shouldHandleKeyDown = false;
		}
		else if (event.ctrlKey && event.key === 'y') {
			tpsRedo();
			shouldHandleKeyDown = false;
		}
    }
    document.onkeyup = function(){
      shouldHandleKeyDown = true;
    }

	console.log(props.user);

	return (
		
		<WLayout wLayout="header-lside">
			<WLHeader>
				<WNavbar color="colored">
					<ul>
						<WNavItem>
							<Logo className='logo' />
						</WNavItem>
					</ul>
					<ul>
						<NavbarOptions
							fetchUser={props.fetchUser} auth={auth}
							setShowCreate={setShowCreate} setShowLogin={setShowLogin}
							refetchTodos={refetch} setActiveList={setActiveList}
						/>
					</ul>
				</WNavbar>
			</WLHeader>

			<WLSide side="left">
				<WSidebar>
					{
						activeList ?
							<SidebarContents
								todolists={todolists} activeid={activeList.id} auth={auth}
								handleSetActive={handleSetActive} createNewList={createNewList}
								updateListField={updateListField}
								activeList={activeList}
								
								
								
							/>
							:
							<></>
					}
				</WSidebar>
			</WLSide>
			<WLMain>
				{
					activeList ?
						<div className="container-secondary">
							<MainContents
								addItem={addItem} deleteItem={deleteItem}
								editItem={editItem} reorderItem={reorderItem}
								setShowDelete={setShowDelete}
								undo={tpsUndo} redo={tpsRedo}
								activeList={activeList} setActiveList={setActiveList}
								closeList={closeList}
								sortItem={sortItem}
								tps={props.tps}
								hasUndo={hasUndo}
								hasRedo={hasRedo}
		

							/>
						</div>
						:
						<div className="container-secondary" />
				}

			</WLMain>

			{
				showDelete && (<Delete deleteList={deleteList} activeid={activeList._id} setShowDelete={setShowDelete} />)
			}

			{
				showCreate && (<CreateAccount fetchUser={props.fetchUser} setShowCreate={setShowCreate} />)
			}

			{
				showLogin && (<Login fetchUser={props.fetchUser} refetchTodos={refetch} setShowLogin={setShowLogin} />)
			}

		</WLayout>
	);
};

export default Homescreen;