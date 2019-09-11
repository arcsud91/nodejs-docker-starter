exports.up = knex => {

    return knex.schema
        .createTable( 'users', usersTable => {

            usersTable.uuid( 'id' ).primary().unique().notNullable().defaultTo( knex.raw( 'UUID()' ) );

            usersTable.string( 'name', 200 ).notNullable();

            usersTable.string( 'email', 200 ).unique().notNullable();
            usersTable.string( 'password', 200 );
            usersTable.boolean( 'is_federated_auth' ).defaultTo( false );

            usersTable.enum( 'role', [ 'admin', 'user' ] ).notNullable().defaultTo( 'user' );

            usersTable.boolean( 'is_activated' ).notNullable().defaultTo( false );

            usersTable.timestamps( false, true );

        } );

};

exports.down = knex => {

    return knex.schema.dropTableIfExists( 'users' );

};
