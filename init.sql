create database dtbox
	owner = postgres -- 所有者
	encoding = 'UTF8'
	lc_collate = 'en_US.UTF-8'
	lc_ctype = 'en_US.UTF-8'
	template = template0;

\c dtbox

create type market_quote as (
	bid_price			float,
	bid_size			int,
	ask_price			float,
	ask_size			int,
	last_update_time	TIMESTAMPTZ
);

create table if not exists users (
	id			serial 			primary key,
	name		varchar(100)	not null unique,
	pass_hash   varchar(100)	not null,
    token       varchar(100)	unique,
    config      json			not null,
    create_time timestamp	 	not null default now()
);

create table if not exists screeners (
	id					serial			primary key,
	name				varchar(100)	not null default 'Unknown',
	create_user_id		int				not null,
	private				boolean			not null default false,
	script				text			not null,
	update_time			timestamp		not null default now(),
	update_state		boolean			not null default false,
	constraint fk_screeners_create_user_id
		foreign key (create_user_id) references users(id)
		on update cascade
		on delete cascade
);

create table if not exists stocks (
	symbol		varchar(20)	primary key,
	company		varchar(50)	not null default 'Unknown',
	sector		varchar(50)	not null default 'Unknown',
	industry	varchar(50)	not null default 'Unknown',
	country		varchar(50)	not null default 'Unknown',
	market_cap	varchar(50)	not null default 'Unknown',
	price		float		not null default 0.0,
	change		float		not null default 0.0,
	volume		int			not null default 0,
	update_time	timestamp		not null default now()
);

create table if not exists book_view (
	symbol	varchar(20)	primary key
		references stocks(symbol)
		on update cascade
		on delete cascade,
	edga	market_quote,
	edgk	market_quote,
	bzx		market_quote,
	byx		market_quote,
	nasdaq	market_quote
);

create table if not exists screened_template (
    symbol	varchar(20)	primary key
		references stocks(symbol)
		on update cascade
		on delete cascade,
    weight	int	not null default 0
    	check (weight between 0 and 100)
);
