class Utils {
	static dateFormat(dataRegister) {
    
    let date = new Date(dataRegister)

		const options = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		};

		return date.toLocaleDateString('pt-BR', options);
	}
}
