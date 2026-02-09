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
			default: '',
			description: 'Space-separated list of scopes to request. Keep it minimal to avoid auth URL errors; add only the scopes required by the endpoints you use.',
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
