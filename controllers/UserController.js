class UserController {
	constructor(formIdCreate, tableId, formIdUpdate) {
		this.tableEl = document.getElementById(tableId);
		this.formEl = document.getElementById(formIdCreate);
		this.formElUpdate = document.getElementById(formIdUpdate);

		this.onSubmit();
		this.onEdit();

		this.selectAll();
	}

	onEdit() {
		document
			.querySelector('#box-user-update .btn-cancel')
			.addEventListener('click', event => {
				this.showPanelCreate();
			});

		this.formElUpdate.addEventListener('submit', event => {
			event.preventDefault();

			const btn = this.formElUpdate.querySelector('[type=submit]');

			btn.disabled = true;
			btn.innerHTML = 'Carregando...';

			let values = this.getValue(this.formElUpdate);

			let index = this.formElUpdate.dataset.trIndex;

			let tr = this.tableEl.rows[index];

			let userOld = JSON.parse(tr.dataset.user);

			let result = Object.assign({}, userOld, values);

			this.getPhoto(this.formElUpdate).then(
				content => {
					if (!values.photo) {
						result._photo = userOld._photo;
					} else {
						result._photo = content;
					}

          let user = new User();

          user.loadFromJSON(result);

          user.save();

					this.getTr(user, tr);

					this.updateCount();

					btn.disabled = false;
					btn.innerHTML = 'Salvar';
					this.formElUpdate.reset();
					this.showPanelCreate();
				},
				event => {
					console.error(event);
				}
			);
		});
	}

	onSubmit() {
		this.formEl.addEventListener('submit', event => {
			event.preventDefault();
			const btn = this.formEl.querySelector('[type=submit]');

			btn.disabled = true;
			btn.innerHTML = 'Carregando...';

			let values = this.getValue(this.formEl);

			if (!values) {
				btn.disabled = false;
				btn.innerHTML = 'Salvar';
				return false;
			}

			this.getPhoto(this.formEl).then(
				content => {
					values.photo = content;
					values.save();
					this.addLine(values);
					this.formEl.reset();
					btn.disabled = false;
					btn.innerHTML = 'Salvar';
				},
				event => {
					console.error(event);
				}
			);
		});
	}

	getPhoto(formEl) {
		return new Promise((resolve, reject) => {
			let fileReader = new FileReader();

			let elements = [...formEl.elements].filter(item => {
				if (item.name == 'photo') {
					return item;
				}
			});

			let file = elements[0].files[0];

			fileReader.onload = () => {
				resolve(fileReader.result);
			};
			fileReader.onerror = event => {
				reject(event);
			};
			if (file) {
				fileReader.readAsDataURL(file);
			} else {
				resolve('dist/img/default-50x50.gif');
			}
		});
	}

	getValue(formEl) {
		let user = {};
		let isValid = true;
		[...formEl.elements].forEach((field, index) => {
			if (
				['name', 'email', 'password'].indexOf(field.name) > -1 &&
				!field.value
			) {
				field.parentElement.classList.add('has-error');
				isValid = false;
			}
			if (field.name == 'gender') {
				if (field.checked) user[field.name] = field.value;
			} else if (field.name == 'admin') {
				user[field.name] = field.checked;
			} else {
				user[field.name] = field.value;
			}
		});

		if (!isValid) {
			return false;
		}

		return new User(
			user.name,
			user.gender,
			user.birth,
			user.country,
			user.email,
			user.password,
			user.photo,
			user.admin
		);
	}

	selectAll() {
		let users = User.getUsersStorage();

		users.forEach(dataUser => {
			let user = new User();

			user.loadFromJSON(dataUser);

			this.addLine(user);
		});
	}

	addLine(dataUser) {
		let tr = this.getTr(dataUser);

		this.tableEl.appendChild(tr);

		this.updateCount();
	}

	getTr(dataUser, tr = null) {
		if (tr === null) tr = document.createElement('tr');

		tr.dataset.user = JSON.stringify(dataUser);

		tr.innerHTML = ` 
    <td><img src="${
			dataUser.photo
		}" alt="User Image" class="img-circle img-sm"></td>
    <td>${dataUser.name}</td>
    <td>${dataUser.email}</td>
    <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
    <td>${Utils.dateFormat(dataUser.register)}</td>
    <td>
      <button type="button" class="btn btn-edit btn-primary btn-xs btn-flat">Editar</button>
      <button type="button" class="btn btn-danger btn-delet btn-xs btn-flat">Excluir</button>
    </td>
`;

		this.addEventTr(tr);

		return tr;
	}

	addEventTr(tr) {
		tr.querySelector('.btn-delet').addEventListener('click', event => {
			if (confirm('Deseja realmente excluir?')) {

        let user = new User();
        
        user.loadFromJSON(JSON.parse(tr.dataset.user));

        user.remove();

				tr.remove();
				this.updateCount();
			}
		});
		tr.querySelector('.btn-edit').addEventListener('click', event => {
			let json = JSON.parse(tr.dataset.user);

			this.formElUpdate.dataset.trIndex = tr.sectionRowIndex;

			for (let name in json) {
				let field = this.formElUpdate.querySelector(
					`[name=${name.replace('_', '')}]`
				);

				if (field) {
					switch (field.type) {
						case 'file':
							continue;
							break;
						case 'radio':
							field = this.formElUpdate.querySelector(
								`[name=${name.replace('_', '')}][value=${json[name]}]`
							);
							field.checked = true;
							break;
						case 'checkbox':
							field.checked = json[name];
							break;
						default:
							field.value = json[name];
					}
				}
			}

			this.formElUpdate.querySelector('.photo').src = json._photo;

			this.showPanelUpdate();
		});
	}

	showPanelCreate() {
		document.querySelector('#box-user-create').style.display = 'block';
		document.querySelector('#box-user-update').style.display = 'none';
	}

	showPanelUpdate() {
		document.querySelector('#box-user-create').style.display = 'none';
		document.querySelector('#box-user-update').style.display = 'block';
	}

	updateCount() {
		let numberUsers = 0;
		let numberAdmins = 0;

		[...this.tableEl.children].forEach(tr => {
			numberUsers++;

			let user = JSON.parse(tr.dataset.user);

			if (user._admin) numberAdmins++;
		});

		document.querySelector('#number-users').innerHTML = numberUsers;
		document.querySelector('#number-admins').innerHTML = numberAdmins;
	}
}
