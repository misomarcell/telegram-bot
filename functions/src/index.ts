import { region, config, logger } from "firebase-functions";
import { Telegraf } from "telegraf";

const prohibitedWords = ["t.me/", "drug", "weed", "hooker"];

const bot = new Telegraf(config().telegram.token, {
	telegram: { webhookReply: true }
});

bot.on("text", async (context) => {
	if (isMessageProhibited(context.message.text)) {
		await context.deleteMessage();
		await context.sendMessage(
			`A message from ${context.message.from.username} was removed due to containing prohibited words.`,
			{
				disable_notification: true
			}
		);
	}
});
bot.catch(async (error: unknown, context) => {
	logger.error("[Bot] Error", { error }, { context });
	await context.telegram.sendMessage(config().telegram["admin-chat-id"], `Error@telegramBot: ${error} ${context}`);
});

exports.telegramBot = region("europe-west1").https.onRequest(async (request, response) => {
	await bot.handleUpdate(request.body, response).then(() => {
		response.status(200).send();
	});

	return;
});

function isMessageProhibited(messageText: string): boolean {
	for (const word of prohibitedWords) {
		if (messageText.includes(word)) return true;
	}

	return false;
}
