class User {
	constructor(name, gender, birth, country, email, password, photo, admin) {
		const now = new Date();
		let dateNow = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

		this._id;
		this._name = name;
		this._gender = gender;
		this._birth = birth;
		this._country = country;
		this._email = email;
		this._password = password;
		this._photo = photo;
		this._admin = admin;
		this._register = dateNow;
	}

	get id() {
		return this._id;
	}
	get register() {
		return this._register;
	}
	get name() {
		return this._name;
	}
	get gender() {
		return this._gender;
	}
	get birth() {
		return this._birth;
	}
	get country() {
		return this._country;
	}
	get email() {
		return this._email;
	}
	get password() {
		return this._password;
	}
	get photo() {
		return this._photo;
	}
	get admin() {
		return this._admin;
	}

	set photo(value) {
		this._photo = value;
	}

	set id(value) {
		this._id = value;
	}

	loadFromJSON(json) {
		for (let name in json) {
			switch (name) {
				case '_regiter':
					this[name] = new Date(json[name]);
					break;
				default:
					this[name] = json[name];
			}
		}
	}

	static getUsersStorage() {
		let users = [];

		if (localStorage.getItem('users')) {
			users = JSON.parse(localStorage.getItem('users'));
		}

		return users;
	}

	getNewId() {

    let usersId = Number(localStorage.getItem('usersId'));

		if (!usersId) usersId = 0;

		usersId++;

    localStorage.setItem('usersId', usersId)

		return usersId;
	}

	save() {
		let users = User.getUsersStorage();

		if (this.id > 0) {
			users.map(u => {
				if (u._id == this.id) {
					Object.assign(u, this);
				}

				return u;
			});
		} else {
			this._id = this.getNewId();
			users.push(this);
		}

		localStorage.setItem('users', JSON.stringify(users));
	}

	remove() {
		let users = User.getUsersStorage();

		users.forEach((userData, index) => {
			if (this._id == userData._id) {
				users.splice(index, 1);
			}
		});

		localStorage.setItem('users', JSON.stringify(users));
	}
}
