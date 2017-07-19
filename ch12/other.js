db.addUser({
	user: "testUser",
	userSource: "test",
	roles: [ "read" ],
	otherDBRoles: { testDB2: [ "readWrite" ] }
})

db.addUser({
	user: "testUser",
	pwd: "test",
	roles: [ "readWrite", "dbAdmin" ]
})