-- public.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE users (
	user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	username varchar(50) NOT NULL,
	"password" text NOT NULL,
	email varchar(255) NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (user_id),
	CONSTRAINT users_username_key UNIQUE (username)
);

-- public.campaigns definition

-- Drop table

-- DROP TABLE campaigns;

CREATE TABLE campaigns (
	campaign_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	campaign_owner_id uuid NULL,
	campaign_title text NOT NULL,
	campaign_desc text NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	delivery_address text NOT NULL DEFAULT 'empty'::text,
	end_date date NOT NULL DEFAULT CURRENT_TIMESTAMP,
	campaign_type text NULL,
	required_item_total int4 NOT NULL DEFAULT 1,
	CONSTRAINT campaigns_pkey PRIMARY KEY (campaign_id),
	CONSTRAINT campaigns_un UNIQUE (campaign_title)
);


-- public.campaigns foreign keys

ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_owner_id_fkey FOREIGN KEY (campaign_owner_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- public.donations definition

-- Drop table

-- DROP TABLE donations;

CREATE TABLE donations (
	donation_id uuid NOT NULL DEFAULT uuid_generate_v4(),
	donation_owner_id uuid NULL,
	campaign_id uuid NULL,
	item_name text NOT NULL,
	item_quanity int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT donation_pkey PRIMARY KEY (donation_id)
);


-- public.donations foreign keys

ALTER TABLE public.donations ADD CONSTRAINT campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id) ON DELETE CASCADE;
ALTER TABLE public.donations ADD CONSTRAINT donation_id_fkey FOREIGN KEY (donation_owner_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- public.campaign_items definition

-- Drop table

-- DROP TABLE campaign_items;

CREATE TABLE campaign_items (
	campaign_item_id serial NOT NULL,
	campaign_id uuid NOT NULL, 
	campaign_item_name text NOT NULL,
	campaign_item_quanity int4 NOT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT campaign_items_pkey PRIMARY KEY (campaign_item_id)
);



-- public.campaign_items foreign keys
ALTER TABLE public.campaign_items ADD CONSTRAINT campaign_items_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id);