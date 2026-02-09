import {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TwitchApi implements ICredentialType {
	name = 'twitchApi';
	displayName = 'Twitch API';
	documentationUrl = 'https://github.com/CodelyTV/n8n-nodes-twitch?tab=readme-ov-file#-how-to-get-twitch-credentials';
	extends = ['oAuth2Api'];
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'string',
			default: 'https://id.twitch.tv/oauth2/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'https://id.twitch.tv/oauth2/token',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'string',
			default: 'analytics:read:extensions analytics:read:games bits:read channel:bot channel:edit:commercial channel:manage:ads channel:manage:broadcast channel:manage:clips channel:manage:extensions channel:manage:guest_star channel:manage:moderators channel:manage:polls channel:manage:predictions channel:manage:raids channel:manage:redemptions channel:manage:schedule channel:manage:videos channel:manage:vips channel:moderate channel:read:ads channel:read:charity channel:read:editors channel:read:goals channel:read:guest_star channel:read:hype_train channel:read:polls channel:read:predictions channel:read:redemptions channel:read:stream_key channel:read:subscriptions channel:read:vips clips:edit editor:manage:clips moderation:read moderator:manage:announcements moderator:manage:automod moderator:manage:automod_settings moderator:manage:banned_users moderator:manage:blocked_terms moderator:manage:chat_messages moderator:manage:chat_settings moderator:manage:guest_star moderator:manage:shield_mode moderator:manage:shoutouts moderator:manage:suspicious_users moderator:manage:unban_requests moderator:manage:warnings moderator:read:automod_settings moderator:read:banned_users moderator:read:blocked_terms moderator:read:chat_messages moderator:read:chat_settings moderator:read:chatters moderator:read:followers moderator:read:guest_star moderator:read:moderators moderator:read:shield_mode moderator:read:shoutouts moderator:read:suspicious_users moderator:read:unban_requests moderator:read:vips moderator:read:warnings user:bot user:edit user:edit:broadcast user:manage:blocked_users user:manage:chat_color user:manage:whispers user:read:blocked_users user:read:broadcast user:read:chat user:read:email user:read:emotes user:read:follows user:read:moderated_channels user:read:subscriptions user:read:whispers user:write:chat',
			description: 'Space-separated list of scopes to request (add required scopes for the endpoints you use)',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://id.twitch.tv',
			url: '/oauth2/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			qs: {
				client_id: '={{$credentials.clientId}}',
				client_secret: '={{$credentials.clientSecret}}',
				grant_type: 'client_credentials',
			},
		},
	};
}
